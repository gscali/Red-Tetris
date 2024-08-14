import { expect } from "chai";
import sinon from "sinon";
import { Socket } from "socket.io";
import { joinRoom } from "../src/joinRoom.js";
import { Game } from "../src/classes/Game.js";
import { Player } from "../src/classes/Player.js";
import { games } from "../src/app.js";

describe("joinRoom", () => {
  let socket, roomName, playerName, hold, barbate, fakePlayer;

  beforeEach(() => {
    socket = sinon.createStubInstance(Socket);
    sinon.stub(socket, "broadcast").value({ emit: sinon.stub() });
    socket.connected = true;
    roomName = "TestRoom";
    playerName = "TestPlayer";
    hold = false;
    barbate = false;
  });

  it("should let a player join a room that doesn't exist yet", () => {
    joinRoom(socket, { roomName, playerName, hold, barbate });
    expect(games[roomName]).to.be.instanceOf(Game);
  });

  it("should let a player join a room that already exists", () => {
    games[roomName] = new Game(roomName, { width: 10, height: 20 }, hold, barbate);
    joinRoom(socket, { roomName, playerName, hold, barbate });
    expect(games[roomName].players.some((player) => player.name === playerName)).to.be.true;
  });

  it("should not let a player join a room that is already full", () => {
    games[roomName] = new Game(roomName, { width: 10, height: 20 }, hold, barbate);
    games[roomName].players = [];
    for (let i = 0; i < games[roomName].roomSize; i++) {
      games[roomName].addPlayer(`Player${i}`, socket);
    }
    joinRoom(socket, { roomName, playerName, hold, barbate });
    expect(games[roomName].players.some((player) => player.name === playerName)).to.be.false;
  });

  it("should not let a player join a room that is already starting or playing", () => {
    games[roomName] = new Game(roomName, { width: 10, height: 20 }, hold, barbate);
    games[roomName].status = "starting";
    joinRoom(socket, { roomName, playerName, hold, barbate });
    expect(games[roomName].players.some((player) => player.name === playerName)).to.be.false;
  });

  it("should let a player join a room as a spectator", () => {
    games[roomName] = new Game(roomName, { width: 10, height: 20 }, hold, barbate);
    games[roomName].status = "starting";
    joinRoom(socket, { roomName, playerName, hold, barbate });
    expect(games[roomName].spectators.some((spectator) => spectator.name === playerName)).to.be.true;
  });

  it("should not let a player join a room with a username already used in the game", () => {
    let socket2 = sinon.createStubInstance(Socket);
    sinon.stub(socket2, "broadcast").value({ emit: sinon.stub() });

    joinRoom(socket, { roomName: "MyRoom", playerName, hold, barbate });

    joinRoom(socket2, { roomName: "MyRoom", playerName });

    expect(games["MyRoom"].players.filter((player) => player.name === playerName).length).to.equal(1);
  });
});
