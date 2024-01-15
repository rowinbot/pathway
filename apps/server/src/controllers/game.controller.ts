import { getCurrentPlayer } from "@/helpers/player.helpers";
import {
  getMatchPlayer,
  movePlayerToTeam,
  nextMatchTurn,
  setMatchWinner,
  startMatch,
  testAndApplyMatchPlayerMovement,
} from "@/services/match.service";
import {
  createNewPartyMatch,
  getPartyActiveMatch,
  getPartyByCode,
  getPartyLastMatch,
  getPartyLastMatchCode,
  joinParty,
  updatePartyPlayerConnected,
} from "@/services/party.service";
import { getSingleHeaderValue } from "@/utils/misc";
import {
  MAX_MATCH_TIME_SECONDS,
  Match,
  Party,
  PartyJoinStatus,
  PartyNewMatchMode,
  TeamI,
  testTeamsLayout,
} from "game-logic";
import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
  ClientToServerEvent,
  ServerToClientEvent,
  MatchCouldNotStartReason,
  NewMatchCouldNotStartReason,
} from "game-logic/realtime";
import { instrument } from "@socket.io/admin-ui";

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const matchCodeToStaleGameTimer = {} as Record<Match["code"], NodeJS.Timeout>;
const matchCodeToTurnTimer = {} as Record<Match["code"], NodeJS.Timeout>;

/**
 * Sets up the game Socket.io server and the match join logic.
 * Everything else is hooked up here but must be implemented/abstracted away from here.
 */
export function createGameSocket(httpServer: HttpServer) {
  const io: AppServer = new Server(httpServer, {
    cors: {
      origin: [
        process.env.WEB_HOST ?? "http://localhost:3000",
        "https://admin.socket.io",
      ],
      credentials: true,
    },
  });

  instrument(io, {
    auth: false,
    mode: "development",
  });

  io.on("connection", (socket) => {
    const partyCode = getSingleHeaderValue(
      socket.handshake.headers["x-party-code"]
    );

    if (!partyCode) {
      return socket.disconnect();
    }

    const player = getCurrentPlayer(
      getSingleHeaderValue(socket.handshake.headers["x-player-id"])
    );

    if (!player) {
      return socket.disconnect();
    }

    // Header x-party-code
    const party = getPartyByCode(partyCode);
    const match = getPartyLastMatch(partyCode);
    const partyJoinStatus = joinParty(partyCode, player);

    // Let the client know the match join status.
    socket.emit(ServerToClientEvent.PARTY_JOIN, partyJoinStatus);

    if (!party || !match || partyJoinStatus !== PartyJoinStatus.SUCCESS) {
      return socket.disconnect();
    }

    const matchPlayer = getMatchPlayer(match.code, player.id)!;

    // Join the room for this match.
    socket.join(partyCode);

    // If match already started, send the board state (could be a re-join).
    if (match.started && match.matchState) {
      socket.emit(
        ServerToClientEvent.PARTY_STATE,
        match.matchState.boardState,
        match.matchState.playerHands[player.id],
        match.matchState.currentTurn,
        match.winner
      );
    }

    updatePartyPlayerConnected(party.code, player.id, true);

    io.to(party.code).emit(
      ServerToClientEvent.PARTY_CONFIG_UPDATED,
      match.config
    );

    io.to(party.code).emit(
      ServerToClientEvent.PARTY_PLAYERS_UPDATED,
      match.players
    );

    onPlayerConnected(party, matchPlayer.id, socket, io);
    setupClientToServerEvents(party, matchPlayer.id, socket, io);
  });
}

function onPlayerConnected(
  party: Party,
  playerId: string,
  socket: AppSocket,
  io: AppServer
) {
  let matchCode = party.matchesCodes[party.matchesCodes.length - 1];
  const player = getMatchPlayer(
    party.matchesCodes[party.matchesCodes.length - 1],
    playerId
  )!;

  socket.data = {
    ...socket.data, // https://github.com/socketio/socket.io-admin-ui/issues/55
    matchCode,
    playerId: player.id,
  };

  socket.onAny((event) => {
    const match = getPartyActiveMatch(getPartyLastMatchCode(party));
    if (!match) return;

    if (event === ClientToServerEvent.MOVEMENT) {
      setupMatchStaleGameTimer(party, match, io);
    }
  });

  socket.on("disconnecting", () => {
    const match = getPartyActiveMatch(getPartyLastMatchCode(party));
    if (!match) return;

    updatePartyPlayerConnected(party.code, player.id, false);
    io.to(party.code).emit(
      ServerToClientEvent.PARTY_PLAYERS_UPDATED,
      match.players
    );
  });
}

function setupClientToServerEvents(
  party: Party,
  currentPlayerId: string,
  socket: AppSocket,
  io: AppServer
) {
  socket.on(ClientToServerEvent.MOVEMENT, (movement, callback) => {
    const match = getPartyActiveMatch(party.code)!;

    if (!match) {
      console.error("Could not find active match for party", party.code);
      callback({
        success: false,
        card: null,
        nextCard: null,
      });
      return;
    }

    const currentPlayer = getMatchPlayer(match.code, currentPlayerId)!;

    const { isMovementValid, newSequences, card, nextCard } =
      testAndApplyMatchPlayerMovement(match.code, currentPlayer.id, movement);

    if (isMovementValid && card) {
      setupMatchTurnTimer(party, match, io);
      const nextTurn = nextMatchTurn(match.code);

      io.to(party.code).emit(
        ServerToClientEvent.PLAYER_MOVEMENT,
        {
          ...movement,
          newSequences,
          card,
          team: currentPlayer.team,
        },
        nextTurn
      );
    }

    callback({
      success: isMovementValid,
      card,
      nextCard,
    });

    // After notifying the client, check if the game is over.

    if (
      currentPlayer &&
      match.matchState &&
      newSequences.length > 0 &&
      match.matchState.teamSequenceCount[currentPlayer.team] >= 2
    ) {
      cleanupMatch(party, match, io, currentPlayer.team);
      return;
    }
  });

  socket.on(ClientToServerEvent.START_GAME, async (callback) => {
    const match = getPartyActiveMatch(party.code)!;
    let didStart = false;

    const matchHasValidTeams = testTeamsLayout(match.players);

    if (currentPlayerId !== match.owner.id)
      return callback(didStart, MatchCouldNotStartReason.notOwner);

    if (!matchHasValidTeams)
      return callback(didStart, MatchCouldNotStartReason.invalidLayout);

    startMatch(match.code);
    setupMatchTurnTimer(party, match, io);
    setupMatchStaleGameTimer(party, match, io);

    const matchState = match.matchState;
    if (!!matchState) {
      didStart = true;

      const sockets = await io.in(party.code).fetchSockets();

      sockets.forEach((neighbouringSocket) => {
        neighbouringSocket.emit(
          ServerToClientEvent.PARTY_STATE,
          matchState.boardState,
          matchState.playerHands[neighbouringSocket.data.playerId],
          matchState.currentTurn,
          match.winner
        );
      });
    }

    callback(didStart, null);
  });

  socket.on(ClientToServerEvent.NEW_MATCH, async (mode, callback) => {
    const oldMatch = getPartyLastMatch(party.code)!;
    let didStart = false;

    const currentPlayer = getMatchPlayer(oldMatch.code, currentPlayerId)!;

    if (currentPlayerId !== oldMatch.owner.id)
      return callback(didStart, NewMatchCouldNotStartReason.notOwner);

    const match = createNewPartyMatch(party.code, currentPlayer, mode);
    if (!match) return callback(didStart, null);

    io.to(party.code).emit(ServerToClientEvent.PARTY_NEW_MATCH, mode);

    io.to(party.code).emit(
      ServerToClientEvent.PARTY_CONFIG_UPDATED,
      match.config
    );

    io.to(party.code).emit(
      ServerToClientEvent.PARTY_PLAYERS_UPDATED,
      match.players
    );

    if (mode === PartyNewMatchMode.FAST_REMATCH) {
      const matchHasValidTeams = testTeamsLayout(oldMatch.players);

      if (!matchHasValidTeams)
        return callback(didStart, NewMatchCouldNotStartReason.invalidLayout);

      startMatch(match.code);
      setupMatchTurnTimer(party, match, io);
      setupMatchStaleGameTimer(party, match, io);

      const matchState = match.matchState;
      if (!matchState) {
        return callback(didStart, null);
      }

      const sockets = await io.in(party.code).fetchSockets();

      sockets.forEach((neighbouringSocket) => {
        neighbouringSocket.emit(
          ServerToClientEvent.PARTY_STATE,
          matchState.boardState,
          matchState.playerHands[neighbouringSocket.data.playerId],
          matchState.currentTurn,
          match.winner
        );
      });
    }

    didStart = true;
    callback(didStart, null);
  });

  socket.on(ClientToServerEvent.MOVE_PLAYER_TO_TEAM, (playerId, team) => {
    const match = getPartyActiveMatch(party.code);

    if (!match) {
      console.error("Could not find active match for party", party.code);
      return;
    }

    const currentPlayer = getMatchPlayer(match.code, currentPlayerId)!;
    if (!currentPlayer.isOwner && playerId !== currentPlayer.id) return;

    movePlayerToTeam(match.code, playerId, team);

    io.to(party.code).emit(
      ServerToClientEvent.PARTY_PLAYERS_UPDATED,
      match.players
    );
  });
}

function setupMatchTurnTimer(party: Party, match: Match, io: AppServer) {
  if (match.code in matchCodeToTurnTimer) {
    clearTimeout(matchCodeToTurnTimer[match.code]);
    delete matchCodeToTurnTimer[match.code];
  }

  matchCodeToTurnTimer[match.code] = setTimeout(() => {
    const nextTurn = nextMatchTurn(match.code);

    io.to(party.code).emit(ServerToClientEvent.TURN_TIMEOUT, nextTurn);
    setupMatchTurnTimer(party, match, io);
  }, match.config.turnTimeLimitSeconds * 1000);
}

function setupMatchStaleGameTimer(party: Party, match: Match, io: AppServer) {
  if (match.code in matchCodeToStaleGameTimer) {
    clearTimeout(matchCodeToStaleGameTimer[match.code]);
    delete matchCodeToStaleGameTimer[match.code];
  }

  matchCodeToStaleGameTimer[match.code] = setTimeout(
    () => cleanupMatch(party, match, io),
    MAX_MATCH_TIME_SECONDS * 1000
  );
}

function cleanupMatch(
  party: Party,
  match: Match,
  io: AppServer,
  winner: TeamI | null = null
) {
  setMatchWinner(match.code, winner);
  io.to(party.code).emit(ServerToClientEvent.MATCH_FINISHED, winner);
  // deleteMatch(match.code);

  // Clear turn timer.
  clearTimeout(matchCodeToTurnTimer[match.code]);
  delete matchCodeToTurnTimer[match.code];

  // Disconnect all sockets in the room.
  // TODO: Make this work with parties.
  // io.to(party.code).disconnectSockets();
}
