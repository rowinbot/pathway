import express from "express";
import { handler as ssrHandler } from "./dist/server/entry.mjs";

const port = process.env.WEB_PORT || 8080;
const app = express();
app.use(express.static("dist/client/"));
app.use(ssrHandler);

app.listen(port);
console.log(`WEB running on ${port}`);
