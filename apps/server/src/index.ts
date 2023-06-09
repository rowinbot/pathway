import { createGameSocket } from "./controllers/game.controller";
import { initApp } from "./server";
import { createServer } from "http";

const port = parseInt(process.env.SERVER_PORT || "3001", 10);

const app = initApp();
const httpServer = createServer(app);
createGameSocket(httpServer);

httpServer.listen(port, process.env.SERVER_HOST || "localhost", () => {
  console.log(`api running on ${process.env.SERVER_HOST} - ${port}`);
});
