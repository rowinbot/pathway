import { getPlayer, playerExists } from "@/services/player.service";
import { getSingleHeaderValue } from "@/utils/misc";
import { Request, Response } from "express";
import { Player } from "game-logic";

export function getCurrentPlayer(req: Request, res: Response): Player | null;
export function getCurrentPlayer(playerId: string | undefined): Player | null;
export function getCurrentPlayer(
  playerIdOrReq: string | undefined | Request,
  res?: Response
): Player | null {
  const receivedPlayerId =
    typeof playerIdOrReq === "string" || playerIdOrReq === undefined;

  let playerId: string | undefined = receivedPlayerId
    ? playerIdOrReq
    : undefined;

  if (!receivedPlayerId) {
    if (typeof res!.locals.playerId === "string") {
      playerId = res!.locals.playerId;
    } else {
      playerId = getSingleHeaderValue(playerIdOrReq.header("x-player-id"));
    }
  }

  if (!playerId || !playerExists(playerId)) {
    return null;
  }

  return getPlayer(playerId);
}
