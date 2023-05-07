import { getCurrentPlayer } from "@/helpers/player.helpers";
import { createPlayer } from "@/services/player.service";
import { Router } from "express";
const router = Router();

router.put("/create", function (req, res) {
  const nickname = req.body.nickname;

  res.status(201).json({
    ...createPlayer(nickname),
    message: "Please, use /matches/:code for a specific match!",
  });
});

router.get("/info", function (req, res) {
  const player = getCurrentPlayer(req, res) ?? createPlayer();

  if (!player) {
    return res.status(404).json({ message: "Player not found!" });
  }

  res.json(player);
});

export { router as playerRouter };
