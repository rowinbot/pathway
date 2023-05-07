import { getCurrentPlayer } from "@/helpers/player.helpers";
import { getMatchByCode, joinMatch } from "@/services/match.service";
import { getSingleHeaderValue } from "@/utils/misc";
import { MatchJoinStatus, staticBoardRows } from "game-logic";
import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "game-logic/realtime";

export function createGameSocket(httpServer: HttpServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
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

    if (matchJoinStatus === MatchJoinStatus.SUCCESS) {
      socket.join(matchCode);
    }

    socket.on("movement", (movement) => {
      const cardAtPos = staticBoardRows[movement.row][movement.col];
      const isValidCardForPos = cardAtPos === movement.card;
      const positionIsFree = true;

      return {
        success: isValidCardForPos && positionIsFree,
      };
    });
  });

  setInterval(() => {
    console.log("Moving");

    io /*.to(matchCode)*/.emit("playerMovement", {
      playerId: "Yejeguan",
      action: "add",
      card: staticBoardRows[Math.floor(Math.random() * 10)][
        Math.floor(Math.random() * 10)
      ] as any,
      row: Math.floor(Math.random() * 10),
      col: Math.floor(Math.random() * 10),
    });
  }, 500);
}
