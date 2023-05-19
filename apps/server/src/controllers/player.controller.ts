import { getCurrentPlayer } from "@/helpers/player.helpers";
import { createPlayer, updatePlayer } from "@/services/player.service";
import { Router } from "express";
const router = Router();

// Gets current player info or creates a new one on demand if no player is found.
router.get("/info", function (req, res) {
  const player = getCurrentPlayer(req, res) ?? createPlayer();

  if (!player) {
    return res.status(404).json({ message: "Player not found!" });
  }

  res.json(player);
});

// Updates current player info. If you need a new player, call the `GET /player/info` endpoint.
router.post("/info", function (req, res) {
  const player = getCurrentPlayer(req, res);
  const { nickname } = req.body;

  if (!player) {
    return res.status(404).json({ message: "Player not found!" });
  }

  const updatedPlayer = updatePlayer(player.id, { nickname });
  res.status(201).json(updatedPlayer);
});

export { router as playerRouter };
