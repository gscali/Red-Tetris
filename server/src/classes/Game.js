import { Player } from "./Player.js";
import { pieces } from "./Piece.js";
import { io } from "../app.js";
import { Spectator } from "./Spectator.js";

export class Game {
  constructor(room, size, hold = false, barbate = false) {
    this.players = [];
    this.spectators = [];
    this.roomSize = 7;
    this.queueSize = 5;
    this.room = room;
    this.size = size ?? { width: 10, height: 20 };
    this.status = "waiting";
    this.queue = [];
    this.countdown = 0;
    this.refillQueue(0);
    this.barbate = barbate;
    this.hold = hold;
  }

  destroy() {
    this.players.forEach((p) => p.destroy());
    io.socketsLeave(this.room);
  }

  addPlayer(name, socket) {
    let p = new Player(name, socket, this);
    this.players.push(p);
    p.socket.join(this.room);
    this.sendUpdate();
    return p;
  }

  removePlayer(name) {
    let p = this.players.find((p) => p.name === name);
    if (!p) return;
    if (["starting", "playing"].includes(this.status)) {
      p.gameOver = true;
      p.destroy();
      p.socket.leave(this.room);
    } else {
      this.players = this.players.filter((p) => p.name !== name);
      p.destroy();
      p.socket.leave(this.room);
    }
    this.sendUpdate();
  }

  addSpectator(name, socket) {
    this.spectators.push(new Spectator(name, socket));
    socket.join(this.room);
    this.sendUpdate();
  }

  removeSpectator(name) {
    this.spectators = this.spectators.filter((s) => s.name !== name);
    this.sendUpdate();
  }

  /**
   * Add a new piece to the queue to keep it at queueSize pieces
   * @description The queue is the same for all players, and is always queueSize pieces long
   * To generate a new piece, the probability of the last piece appearing is 2/56 = 3.57 %
   * and the probability of any other piece appearing is 9/56 = 16.07 %
   * @param queueIndex The player's queue index (to make sure we always have enough for queueSize pieces in the queue)
   */
  refillQueue(queueIndex = 0) {
    while (this.queue.length < queueIndex + 7) {
      let r = Math.random();
      let last = this.queue[this.queue.length - 1];
      let others = Object.keys(pieces).filter((p) => p !== last);
      if (!this.barbate) others = others.filter((p) => p !== "barbate");
      this.queue.push(last && r < 2 / 56 ? last : others[Math.floor(Math.random() * others.length)]);
    }
  }

  addMalusToAllPlayers(rows, ignorePseudo) {
    this.players.forEach((p) => {
      if (p.name !== ignorePseudo) {
        p.addMalusRows(rows);
      }
    });
    this.sendUpdate();
  }

  sendUpdate() {
    io.to(this.room).emit("update", {
      // For now, we're sending all players data to all players
      // This is not ideal, but it's a simple way to keep all clients in sync
      players: this.players.map((p) => p.representation()),
      spectators: this.spectators.length,
      status: this.status,
      host: this.players.filter((p) => p.socket.connected)?.[0]?.name,
      countdown: this.countdown,
      hold: this.hold,
    });
    io.emit("room-update", { name: this.room, players: this.players.length });
  }

  start() {
    this.status = "playing";
    this.players.forEach((p) => p.startGame());
  }

  startCountdown() {
    if (["starting", "playing"].includes(this.status)) return;
    this.status = "starting";
    this.countdown = 3;

    let interval = setInterval(() => {
      this.countdown--;

      if (this.status !== "starting") {
        clearInterval(interval);
        return;
      }

      if (this.countdown === 0) {
        clearInterval(interval);
        this.start();
      }
      this.sendUpdate();
    }, 1000);

    this.sendUpdate();
  }

  reset() {
    this.status = "waiting";
    this.queue = [];
    this.refillQueue(0);
    this.players = this.players.filter((p) => p.socket.connected);
    this.players.forEach((p) => {
      p.resetGame();
    });
    for (let spectator of this.spectators) {
      if (this.players.length >= this.roomSize) {
        break;
      }
      this.players.push(new Player(spectator.name, spectator.socket, this));
      this.spectators = this.spectators.filter((s) => s.name !== spectator.name);
    }
    this.sendUpdate();
  }
}
