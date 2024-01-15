import { getCurrentPlayer } from "@/helpers/player.helpers";
import { getMatchPlayer, newMatchPlayerObj } from "@/services/match.service";
import {
  joinParty,
  createParty,
  getPartyByCode,
  getPartyActiveMatch,
} from "@/services/party.service";
import { Router } from "express";
import { PartyJoinStatus } from "game-logic";
const router = Router();

router.use(function (req, res, next) {
  const player = getCurrentPlayer(req, res);

  if (!player) {
    return res.status(401).json({ message: "Missing or invalid player id!" });
  }

  res.locals.playerId = player.id;

  next();
});

router.put("/create", function (req, res) {
  const player = getCurrentPlayer(req, res)!;
  const matchPlayer = newMatchPlayerObj(player);
  const party = createParty(matchPlayer);

  res.status(201).json(party);
});

router.post("/join/:code", function (req, res) {
  const player = getCurrentPlayer(req, res)!;

  const code = req.params.code;
  const party = getPartyByCode(code);
  const activeMatch = getPartyActiveMatch(code);

  if (!party || !activeMatch) {
    return res.status(404).json({ partyJoinStatus: PartyJoinStatus.NOT_FOUND });
  }

  if (activeMatch.started) {
    const matchPlayer = getMatchPlayer(code, player.id);

    if (!matchPlayer) {
      return res.status(404).json({ partyJoinStatus: PartyJoinStatus.BUSY });
    }
  }

  const joinStatus = joinParty(code, player);

  let statusCode: number;

  if (joinStatus === PartyJoinStatus.NOT_FOUND) {
    statusCode = 404;
  } else if (joinStatus === PartyJoinStatus.FULL) {
    statusCode = 409;
  } else if (joinStatus === PartyJoinStatus.BUSY) {
    statusCode = 403;
  } else {
    statusCode = 200;
  }

  return res.status(statusCode).json({
    party,
    partyJoinStatus: joinStatus,
  });
});

export { router as partyRouter };
