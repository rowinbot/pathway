import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { partyRouter } from "./controllers/party.controller";
import { playerRouter } from "./controllers/player.controller";

export const initApp = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .use("/party", partyRouter)
    .use("/player", playerRouter)
    .get("/healthz", (_req, res) => {
      return res.json({ ok: true });
    });

  return app;
};
