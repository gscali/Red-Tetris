import { expect } from "chai";
import sinon from "sinon";
import { Socket } from "socket.io";
import { Game } from "../src/classes/Game.js";
import { pieces } from "../src/classes/Piece.js";

describe("Player", () => {
  let mockSocket;
  let game;
  let player;

  beforeEach(() => {
    mockSocket = sinon.createStubInstance(Socket);
    game = new Game("testRoom", { width: 10, height: 20 }, true, false);
    player = game.addPlayer("TestPlayer", mockSocket);
    game.start();
  });

  it("player name should be TestPlayer", () => expect(player.name).to.equal("TestPlayer"));
  it("player socket should be mockSocket", () => expect(player.socket).to.equal(mockSocket));
  it("player score should be 0", () => expect(player.score).to.equal(0));
  it("player gameOver should be false", () => expect(player.gameOver).to.be.false);
  it("player piece should not be undefined", () => expect(player.piece).to.not.be.undefined);
  it("player piece should be in the game", () => expect(game.players.map((p) => p.piece)).to.include(player.piece));

  it("score should be updated correctly", () => {
    player.addScore(100);
    expect(player.score).to.equal(100);
  });
});

describe("Player Piece Movement", () => {
  let mockSocket;
  let game;
  let player;

  beforeEach(() => {
    mockSocket = sinon.createStubInstance(Socket);
    game = new Game("testRoom", { width: 10, height: 20 }, true, false);
    player = game.addPlayer("TestPlayer", mockSocket);
    game.start();
  });

  it("should move piece left correctly", () => {
    const initialX = player.piece?.x;
    player.keydown("ArrowLeft");
    expect(initialX).to.not.be.undefined; // Ensure the piece is initialized
    expect(player.piece?.x).to.equal(initialX - 1);
  });

  it("should move piece right correctly", () => {
    const initialX = player.piece?.x;
    player.keydown("ArrowRight");
    expect(initialX).to.not.be.undefined; // Ensure the piece is initialized
    expect(player.piece?.x).to.equal(initialX + 1);
  });

  it("should not allow piece to move outside left boundary", () => {
    function getMostLeftX() {
      let coords = player.getPieceCoordinates(player.piece.x, player.piece.y, player.piece.orientation, pieces[player.piece.name]);
      return coords.reduce((acc, coord) => Math.min(acc, coord[1]), game.size.width);
    }

    // Position piece at the leftmost boundary
    while (getMostLeftX() > 0) {
      player.keydown("ArrowLeft");
    }

    const boundaryX = getMostLeftX();
    player.keydown("ArrowLeft"); // Attempt to move left again
    expect(getMostLeftX()).to.equal(boundaryX); // x coordinate should not change
  });

  it("should not allow piece to move outside right boundary", () => {
    function getMostRightX() {
      let coords = player.getPieceCoordinates(player.piece.x, player.piece.y, player.piece.orientation, pieces[player.piece.name]);
      return coords.reduce((acc, coord) => Math.max(acc, coord[0]), 0);
    }

    // Position piece at the rightmost boundary
    while (getMostRightX() < game.size.width - 1) {
      player.keydown("ArrowRight");
    }

    const boundaryX = getMostRightX();
    player.keydown("ArrowRight"); // Attempt to move right again
    expect(getMostRightX()).to.equal(boundaryX); // x coordinate should not change
  });
});

describe("Player Piece Rotation", () => {
  let mockSocket;
  let game;
  let player;

  beforeEach(() => {
    mockSocket = sinon.createStubInstance(Socket);
    game = new Game("testRoom", { width: 10, height: 20 }, true, false);
    player = game.addPlayer("TestPlayer", mockSocket);
    game.start();
  });

  it("should rotate piece correctly", () => {
    const initialRotation = player.piece.orientation;
    player.keydown("ArrowUp");
    expect(player.piece.orientation).to.equal((initialRotation + 1) % 4);
  });

  it("should not allow piece to rotate outside left boundary", () => {
    // show not throw error when rotating after hitting left boundary
    function getMostLeftX() {
      let coords = player.getPieceCoordinates(player.piece.x, player.piece.y, player.piece.orientation, pieces[player.piece.name]);
      return coords.reduce((acc, coord) => Math.min(acc, coord[1]), game.size.width);
    }

    while (getMostLeftX() > 0) {
      player.keydown("ArrowLeft");
    }
    player.keydown("ArrowUp");
    player.keydown("ArrowUp");
    player.keydown("ArrowUp");
    player.keydown("ArrowUp");
  });

  it("should not allow piece to rotate outside right boundary", () => {
    function getMostRightX() {
      let coords = player.getPieceCoordinates(player.piece.x, player.piece.y, player.piece.orientation, pieces[player.piece.name]);
      return coords.reduce((acc, coord) => Math.max(acc, coord[0]), 0);
    }

    while (getMostRightX() < game.size.width - 1) {
      player.keydown("ArrowRight");
    }
    player.keydown("ArrowUp");
    player.keydown("ArrowUp");
    player.keydown("ArrowUp");
    player.keydown("ArrowUp");
  });
});

describe("Player Piece Drop", () => {
  let mockSocket;
  let game;
  let player;

  beforeEach(() => {
    mockSocket = sinon.createStubInstance(Socket);
    game = new Game("testRoom", { width: 10, height: 20 }, true, false);
    player = game.addPlayer("TestPlayer", mockSocket);
    game.start();
  });

  it("should drop piece correctly", () => {
    const initialY = player.piece.y;
    player.keydown("ArrowDown");
    expect(player.piece.y).to.equal(initialY - 1);
  });

  it("should not allow piece to drop outside bottom boundary", () => {
    function getMostBottomY() {
      let coords = player.getPieceCoordinates(player.piece.x, player.piece.y, player.piece.orientation, pieces[player.piece.name]);
      return coords.reduce((acc, coord) => Math.min(acc, coord[0]), game.size.height);
    }

    while (getMostBottomY() > 0) {
      player.keydown("ArrowDown");
    }

    const boundaryY = getMostBottomY();
    player.keydown("ArrowDown");
    expect(getMostBottomY()).to.equal(boundaryY);
  });

  it("should drop piece to the bottom correctly", () => {
    player.keydown(" ");
    expect(player.map[0].some((cell) => cell == "")).to.be.true;
  });
});

describe("Player Piece Swap", () => {
  let mockSocket;
  let game;
  let player;

  beforeEach(() => {
    mockSocket = sinon.createStubInstance(Socket);
    game = new Game("testRoom", { width: 10, height: 20 }, true, false);
    player = game.addPlayer("TestPlayer", mockSocket);
    game.start();
  });

  it("should swap piece correctly", () => {
    const initialPiece = player.piece;
    const next = game.queue[player.queueIndex + 1];
    player.swapPiece();
    expect(player.piece.name).to.equal(next);
    expect(player.hold).to.equal(initialPiece.name);
  });

  // it("should not allow piece to be swapped more than once", () => {
  //   let hold = player.hold;
  //   player.swapPiece();
  //   expect(player.hold).to.not.equal(hold);
  //   hold = player.hold;

  //   player.swapPiece();
  //   expect(player.hold).to.equal(hold);
  // });

  it("should not allow piece to be swapped when hold is disabled", () => {
    game.hold = false;
    const initialPiece = player.piece;
    player.swapPiece();
    expect(player.piece.name).to.equal(initialPiece.name);
  });

  it("should not allow piece to be swapped when no piece is present", () => {
    player.piece = undefined;
    player.swapPiece();
    expect(player.piece).to.be.undefined;
  });
});

after(() => process.exit(0));
