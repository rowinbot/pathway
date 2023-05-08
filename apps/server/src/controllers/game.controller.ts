import { getCurrentPlayer } from "@/helpers/player.helpers";
import {
  getMatchByCode,
  getMatchPlayer,
  joinMatch,
  nextMatchTurn,
  startMatch,
  testAndApplyMatchPlayerMovement,
  updateMatchPlayerConnected,
} from "@/services/match.service";
import { getSingleHeaderValue } from "@/utils/misc";
import { Match, MatchJoinStatus, MatchPlayer, Player } from "game-logic";
import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
  ClientToServerEvent,
  ServerToClientEvent,
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

/**
 * Sets up the game Socket.io server and the match join logic.
 * Everything else is hooked up here but must be implemented/abstracted away from here.
 */
export function createGameSocket(httpServer: HttpServer) {
  const io: AppServer = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
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
  // If match already started, send the board state (could be a re-join).
  if (match.started && match.matchState) {
    socket.emit(
      ServerToClientEvent.MATCH_STATE,
      match.matchState.boardState,
      match.matchState.playerHands[player.id]
    );
  }

  updateMatchPlayerConnected(match.code, player.id, true);
  io.to(match.code).emit(
    ServerToClientEvent.MATCH_PLAYERS_UPDATED,
    match.players
  );

  socket.data = {
    matchCode: match.code,
    playerId: player.id,
  };

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
    const { isMovementValid, card, nextCard } = testAndApplyMatchPlayerMovement(
      match.code,
      player.id,
      movement
    );

    if (isMovementValid && card) {
      const nextTurn = nextMatchTurn(match.code);

      io.to(match.code).emit(
        ServerToClientEvent.PLAYER_MOVEMENT,
        {
          ...movement,
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

    if (player.id !== match.owner.id) return callback(didStart);

    startMatch(match.code);

    const matchState = match.matchState;
    if (!!matchState) {
      didStart = true;

      const sockets = await io.in(match.code).fetchSockets();

      sockets.forEach((neighbouringSocket) => {
        neighbouringSocket.emit(
          ServerToClientEvent.MATCH_STATE,
          matchState.boardState,
          matchState.playerHands[neighbouringSocket.data.playerId]
        );
      });
    }

    callback(didStart);
  });
}
