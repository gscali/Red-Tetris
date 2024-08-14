import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import sqlite3 from "sqlite3";
import cors from "cors";
import { joinRoom } from "./joinRoom.js";
import * as fs from "fs";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const httpServer = createServer(app);
if (!fs.existsSync("scores")) fs.mkdirSync("scores");
const db = new sqlite3.Database(`scores/${process.env.NODE_ENV}.db`);

export const games = {};
export const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join-room", (data) => joinRoom(socket, data));
});

app.use(cors());

db.run("CREATE TABLE IF NOT EXISTS scores (pseudo TEXT PRIMARY KEY, score INTEGER)");

app.get("/rooms", function (req, res) {
  return res.send(Object.values(games).map((room) => ({ name: room.room, players: room.players.length })));
});

app.get("/scores", async function (req, res) {
  return db.all("SELECT * FROM scores ORDER BY score DESC LIMIT 10", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database Error");
    }
    return res.send(rows.map((row) => ({ name: row.pseudo, score: row.score })));
  });
});

app.use(express.static("../client/dist"));

app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "../client/dist" });
});

export function updateBestScore(pseudo, score) {
  db.get("SELECT score FROM scores WHERE pseudo = ?", pseudo, (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (!row || row.score < score) {
      db.run("INSERT OR REPLACE INTO scores (pseudo, score) VALUES (?, ?)", [pseudo, score]);
    }
  });
}

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
