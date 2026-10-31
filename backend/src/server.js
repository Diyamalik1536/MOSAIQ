import { createApp } from "./app.js";
import process from "node:process";

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "localhost";
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid TCP port.");
createApp().listen(port, host, () => console.log(`TalentForge Analytics API listening on ${host}:${port}`));
