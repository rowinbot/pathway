import { getCurrentPlayer } from "@/helpers/player.helpers";
import {
  createMatch,
  getMatchByCode,
  getMatchPlayer,
  joinMatch,
} from "@/services/match.service";
import { Router } from "express";
import { MatchJoinStatus } from "game-logic";
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
  const matchPlayer = { ...player, isOwner: true };
  const match = createMatch(matchPlayer);

  res.status(201).json(match);
});

router.post("/join/:code", function (req, res) {
  const player = getCurrentPlayer(req, res)!;

  const code = req.params.code;
  const match = getMatchByCode(code);

  if (!match) {
    return res
      .status(404)
      .json({ matchJoinStatus: MatchJoinStatus.MATCH_NOT_FOUND });
  }

  if (match.started) {
    const matchPlayer = getMatchPlayer(code, player.id);

    if (!matchPlayer) {
      return res
        .status(404)
        .json({ matchJoinStatus: MatchJoinStatus.MATCH_STARTED });
    }
  }

  const joined = joinMatch(code, player);

  let statusCode: number;

  if (joined === MatchJoinStatus.MATCH_NOT_FOUND) {
    statusCode = 404;
  } else if (joined === MatchJoinStatus.MATCH_FULL) {
    statusCode = 409;
  } else if (joined === MatchJoinStatus.MATCH_STARTED) {
    statusCode = 403;
  } else {
    statusCode = 200;
  }

  return res.status(statusCode).json({
    match,
    matchJoinStatus: joined
      ? MatchJoinStatus.MATCH_FULL
      : MatchJoinStatus.SUCCESS,
  });
});

export { router as matchRouter };
