import { Game } from "./classes/Game.js";
import { games } from "./app.js";

export function joinRoom(socket, { roomName, playerName, hold = false, barbate = false }) {
  if (Object.values(games).some((game) => game.players.some((player) => player.name === playerName && player.socket.connected))) {
    socket.emit("room-join-failed", "Username already used in game ! Maybe try Barbate ?");
    socket.disconnect();
    return;
  }
  socket.join(roomName);
  if (!games[roomName]) {
    socket.broadcast.emit("room-created", roomName);
    games[roomName] = new Game(roomName, { width: 10, height: 20 }, hold, barbate);
  }
  let room = games[roomName];
  if (["starting", "playing"].includes(room.status) || room.players.length >= room.roomSize) {
    room.addSpectator(playerName, socket);
    socket.on("disconnect", () => {
      room.removeSpectator(playerName);
    });
  } else {
    room.addPlayer(playerName, socket);
    socket.broadcast.emit("room-update", { name: room.room, players: room.players.length });
    socket.on("disconnect", () => {
      room.removePlayer(playerName);
      socket.broadcast.emit("room-update", { name: room.room, players: room.players.length });
      if (room.players.every((p) => !p.socket.connected) && room.spectators.every((s) => !s.socket.connected)) {
        room.destroy();
        socket.broadcast.emit("room-destroyed", roomName);
        delete games[roomName];
      }
    });
  }
}
