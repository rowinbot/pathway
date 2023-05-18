import { getCurrentPlayer } from "@/helpers/player.helpers";
import {
  deleteMatch,
  getMatchByCode,
  getMatchPlayer,
  joinMatch,
  nextMatchTurn,
  startMatch,
  testAndApplyMatchPlayerMovement,
  updateMatchPlayerConnected,
} from "@/services/match.service";
import { getSingleHeaderValue } from "@/utils/misc";
import {
  MAX_MATCH_TIME_SECONDS,
  Match,
  MatchJoinStatus,
  MatchPlayer,
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
} from "game-logic/realtime";

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
      origin: process.env.WEB_HOST ?? "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    const matchCode = getSingleHeaderValue(
      socket.handshake.headers["x-match-code"]
    );

    if (!matchCode) {
      return socket.disconnect();
    }

    const player = getCurrentPlayer(
      getSingleHeaderValue(socket.handshake.headers["x-player-id"])
    );

    if (!player) {
      return socket.disconnect();
    }

    // Header x-match-code
    const match = getMatchByCode(matchCode);
    const matchJoinStatus = joinMatch(matchCode, player);

    // Let the client know the match join status.
    socket.emit(ServerToClientEvent.MATCH_JOIN, matchJoinStatus);

    if (!match || matchJoinStatus !== MatchJoinStatus.SUCCESS) {
      return socket.disconnect();
    }

    const matchPlayer = getMatchPlayer(matchCode, player.id)!;

    // Join the room for this match.
    socket.join(matchCode);

    onPlayerConnected(match, matchPlayer, socket, io);
    setupClientToServerEvents(match, matchPlayer, socket, io);
  });
}

function onPlayerConnected(
  match: Match,
  player: MatchPlayer,
  socket: AppSocket,
  io: AppServer
) {
  io.to(match.code).emit(
    ServerToClientEvent.MATCH_CONFIG_UPDATED,
    match.config
  );

  updateMatchPlayerConnected(match.code, player.id, true);
  io.to(match.code).emit(
    ServerToClientEvent.MATCH_PLAYERS_UPDATED,
    match.players
  );

  // If match already started, send the board state (could be a re-join).
  if (match.started && match.matchState) {
    socket.emit(
      ServerToClientEvent.MATCH_STATE,
      match.matchState.boardState,
      match.matchState.playerHands[player.id],
      match.matchState.currentTurn
    );
  }

  socket.data = {
    matchCode: match.code,
    playerId: player.id,
  };

  socket.onAny((event) => {
    if (event === ClientToServerEvent.MOVEMENT) {
      setupMatchStaleGameTimer(match, io);
    }
  });

  socket.on("disconnecting", () => {
    updateMatchPlayerConnected(match.code, player.id, false);
    io.to(match.code).emit(
      ServerToClientEvent.MATCH_PLAYERS_UPDATED,
      match.players
    );
  });
}

function setupClientToServerEvents(
  match: Match,
  player: MatchPlayer,
  socket: AppSocket,
  io: AppServer
) {
  socket.on(ClientToServerEvent.MOVEMENT, (movement, callback) => {
    const { isMovementValid, newSequences, card, nextCard } =
      testAndApplyMatchPlayerMovement(match.code, player.id, movement);

    if (isMovementValid && card) {
      setupMatchTurnTimer(match, io);
      const nextTurn = nextMatchTurn(match.code);

      io.to(match.code).emit(
        ServerToClientEvent.PLAYER_MOVEMENT,
        {
          ...movement,
          newSequences,
          card,
          team: player.team,
        },
        nextTurn
      );
    }

    callback({
      success: isMovementValid,
      card,
      nextCard,
    });
  });

  socket.on(ClientToServerEvent.START_GAME, async (callback) => {
    let didStart = false;
    const matchHasValidTeams = true || testTeamsLayout(match.players);

    if (player.id !== match.owner.id)
      return callback(didStart, MatchCouldNotStartReason.notOwner);

    if (!matchHasValidTeams)
      return callback(didStart, MatchCouldNotStartReason.invalidLayout);

    startMatch(match.code);
    setupMatchTurnTimer(match, io);
    setupMatchStaleGameTimer(match, io);

    const matchState = match.matchState;
    if (!!matchState) {
      didStart = true;

      const sockets = await io.in(match.code).fetchSockets();

      sockets.forEach((neighbouringSocket) => {
        neighbouringSocket.emit(
          ServerToClientEvent.MATCH_STATE,
          matchState.boardState,
          matchState.playerHands[neighbouringSocket.data.playerId],
          matchState.currentTurn
        );
      });
    }

    callback(didStart, null);
  });
}

function setupMatchTurnTimer(match: Match, io: AppServer) {
  if (match.code in matchCodeToTurnTimer) {
    clearTimeout(matchCodeToTurnTimer[match.code]);
    delete matchCodeToTurnTimer[match.code];
  }

  matchCodeToTurnTimer[match.code] = setTimeout(() => {
    const nextTurn = nextMatchTurn(match.code);

    io.to(match.code).emit(ServerToClientEvent.TURN_TIMEOUT, nextTurn);
    setupMatchTurnTimer(match, io);
  }, match.config.turnTimeLimitSeconds * 1000);
}

function setupMatchStaleGameTimer(match: Match, io: AppServer) {
  if (match.code in matchCodeToStaleGameTimer) {
    clearTimeout(matchCodeToStaleGameTimer[match.code]);
    delete matchCodeToStaleGameTimer[match.code];
  }

  matchCodeToStaleGameTimer[match.code] = setTimeout(() => {
    io.to(match.code).emit(ServerToClientEvent.MATCH_FINISHED, null);
    deleteMatch(match.code);

    // Clear turn timer.
    clearTimeout(matchCodeToTurnTimer[match.code]);
    delete matchCodeToTurnTimer[match.code];

    // Disconnect all sockets in the room.
    io.to(match.code).disconnectSockets();
  }, MAX_MATCH_TIME_SECONDS * 1000);
}
