import { expect } from "chai";
import { Game } from "../src/classes/Game.js";
import { Socket } from "socket.io";
import sinon from "sinon";

describe("Game", () => {
  describe("refillQueue", () => {
    let game;
    beforeEach(() => {
      game = new Game("testRoom", { width: 10, height: 20 }, true, false);
    });
    it("should refill the queue correctly", () => {
      game.refillQueue(0);
      expect(game.queue.length).to.equal(7);

      game.refillQueue(3);
      expect(game.queue.length).to.equal(10);

      game.refillQueue(7);
      expect(game.queue.length).to.equal(14);
    });
  });

  describe("removePlayer", () => {
    let player;
    let socket;
    let game;

    beforeEach(() => {
      try {
        socket = sinon.createStubInstance(Socket);
        sinon.stub(socket, "broadcast").value({ emit: sinon.stub() });

        game = new Game("testRoom", { width: 10, height: 20 }, true, false);
        player = game.addPlayer("testPlayer", socket);

        sinon.stub(game, "sendUpdate");
      } catch (error) {
        console.log(error);
      }
    });

    afterEach(() => {
      game.sendUpdate.restore();
    });

    it("should remove a player when game status is not 'starting' or 'playing'", () => {
      game.removePlayer("testPlayer");
      expect(game.players).to.not.include(player);
      expect(socket.leave.calledOnce).to.be.true;
      expect(game.sendUpdate.calledOnce).to.be.true;
    });

    it("should do nothing when the player to be removed does not exist", () => {
      game.removePlayer("nonexistentPlayer");
      expect(game.players).to.include(player);
      expect(socket.leave.called).to.be.false;
      expect(game.sendUpdate.called).to.be.false;
    });
  });
});
