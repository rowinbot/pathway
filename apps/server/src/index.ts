import { createGameSocket } from "./controllers/game.controller";
import { initApp } from "./server";
import { createServer } from "http";

const port = parseInt(process.env.SERVER_PORT || "3001", 10);

const app = initApp();
const httpServer = createServer(app);
createGameSocket(httpServer);

httpServer.listen(port, "127.0.0.1", () => {
  console.log(`api running on ${port}`);
});
