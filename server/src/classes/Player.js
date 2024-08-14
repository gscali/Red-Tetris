import { pieces } from "./Piece.js";
import { updateBestScore } from "../app.js";

export class Player {
  constructor(name, socket, game) {
    this.name = name;
    this.socket = socket;
    this.game = game;

    socket.on("keydown", (key) => this.keydown(key));

    socket.on("start-game", () => {
      if (this.game.players.filter((p) => p.socket.connected)?.[0]?.name !== this.name) return;
      this.game.startCountdown();
    });
    this.resetGame();

    socket.on("restart-game", () => {
      if (this.game.players.filter((p) => p.socket.connected)?.[0]?.name !== this.name) return;
      this.game.reset();
    });
  }

  addScore(score) {
    this.score += score;
    updateBestScore(this.name, this.score);
  }

  resetGame() {
    this.gameOver = false;
    this.lostAt = undefined;
    this.hasSwapped = false;
    this.score = 0;
    this.queueIndex = -1;
    this.piece = undefined;
    this.hold = "";
    this.map = Array.from({ length: this.game.size.height + 2 }, () => Array(this.game.size.width).fill(""));
    this.game.refillQueue(0);
  }

  startGame() {
    this.resetGame();
    this.nextPiece();
    this.piece = {
      x: this.game.size.width / 2,
      y: this.game.size.height,
      name: this.game.queue[0],
      orientation: 0,
    };
    this.restartTimer();
  }

  destroy() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  restartTimer() {
    this.timeout = setTimeout(this.gravity.bind(this), Math.max(500, 1000 - this.score / 10));
  }

  gravity() {
    if (this.gameOver || this.game.status !== "playing" || this.piece === undefined) {
      if (this.timeout) clearTimeout(this.timeout);
      return;
    }

    this.restartTimer();

    let shape = pieces[this.piece.name];
    if (this.checkPosition(this.piece.x, this.piece.y - 1, this.piece.orientation, shape)) {
      this.piece.y--;
      this.game.sendUpdate();
      return;
    } else {
      this.placeCurrentPiece();
    }
  }

  getPieceCoordinates = (centerX, centerY, orientation, shape) => {
    for (let i = 0; i < orientation; i++) {
      shape = shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
    }

    let coordinates = [];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          coordinates.push([centerY - y, centerX + x - Math.floor(shape.length / 2)]);
        }
      }
    }

    return coordinates;
  };

  getTargetCoordinates = (pieceX, pieceY, orientation, shape) => {
    let previous = this.getPieceCoordinates(pieceX, 0, orientation, shape);
    for (let y = pieceY; y >= 0; y--) {
      let coords = this.getPieceCoordinates(pieceX, y, orientation, shape);
      if (!this.checkPosition(pieceX, y, orientation, shape)) {
        return previous;
      }
      previous = coords;
    }

    return previous;
  };
  calculateScore = (rows) => {
    return rows * (rows + 1) * 50;
  };

  clearFullRows() {
    let rows = this.map.filter((row) => row.every((cell) => cell !== "" && cell !== "malus"));

    for (let i = 0; i < rows.length; i++) {
      this.map.splice(this.map.indexOf(rows[i]), 1);
      this.map.push(Array(this.game.size.width).fill(""));
    }

    this.addScore(this.calculateScore(rows.length));

    if (rows.length > 1) this.game.addMalusToAllPlayers(rows.length - 1, this.name);

    return rows.length;
  }

  addMalusRows = (rows) => {
    if (this.gameOver || this.game.status !== "playing") return;
    for (let i = 0; i < rows; i++) {
      this.map.pop();
      this.map.unshift(Array(this.game.size.width).fill("malus"));
      if (this.map[this.game.size.height].some((cell) => cell !== "")) {
        this.endGame();
        return;
      }
    }
  };

  endGame = () => {
    this.gameOver = true;
    this.lostAt = Date.now();
    if (this.game.players.every((p) => p.gameOver)) {
      this.game.status = "ended";
    }
    this.game.sendUpdate();
  };

  checkPosition = (centerX, centerY, orientation, shape) => {
    let coords = this.getPieceCoordinates(centerX, centerY, orientation, shape);

    for (let c of coords) {
      if (c[0] < 0 || c[1] < 0 || c[1] >= this.game.size.width || (this.map[c[0]] && this.map[c[0]][c[1]] !== "")) {
        return false;
      }
    }

    return true;
  };

  nextPiece = () => {
    this.queueIndex++;
    this.hasSwapped = false;
    this.game.refillQueue(this.queueIndex);
    this.piece = {
      x: this.game.size.width / 2,
      y: this.game.size.height,
      name: this.game.queue[this.queueIndex],
      orientation: 0,
    };
    for (let i = 0; i < 3; i++) {
      if (this.checkPosition(this.game.size.width / 2, this.piece.y, this.piece.orientation, pieces[this.piece.name])) break;
      this.piece.y++;
    }
  };

  barbateRow = (y) => {
    if (this.gameOver || this.game.status !== "playing") return;

    let cells = this.map[y].map((name, x) => ({ x, y, name })).filter((cell) => cell.name !== "");
    this.socket.emit("barbate-row", cells);

    this.map.splice(y, 1);
    this.map.push(Array(this.game.size.width).fill(""));

    this.addScore(100);

    this.game.sendUpdate();
  };

  placeCurrentPiece = () => {
    if (!this.piece) return;
    let currentShape = pieces[this.piece.name];
    let coords = this.getTargetCoordinates(this.piece.x, this.piece.y, this.piece.orientation, currentShape);

    for (let c of coords) {
      if (c[0] >= this.game.size.height) {
        this.endGame();
        return false;
      }
      this.map[c[0]][c[1]] = this.piece.name;
      if (this.piece.name === "barbate") this.barbateRow(c[0]);
    }

    this.clearFullRows();
    this.nextPiece();

    if (this.timeout) clearTimeout(this.timeout);
    this.restartTimer();

    this.game.sendUpdate();
  };

  swapPiece() {
    if (!this.game.hold) return;
    if (!this.piece) return;
    if (this.hasSwapped) return;
    this.hasSwapped = true;
    if (this.hold === "") {
      this.hold = this.piece.name;
      this.nextPiece();
    } else {
      let name = this.hold;
      this.hold = this.piece.name;
      this.piece = {
        x: this.game.size.width / 2,
        y: this.game.size.height,
        name,
        orientation: 0,
      };
    }

    this.game.sendUpdate();
  }

  keydown(key) {
    if (this.gameOver || this.game.status !== "playing") return;
    if (key === " ") {
      this.placeCurrentPiece();
      return;
    }
    if (key === "Enter") {
      this.swapPiece();
      return;
    }

    let newSelected = { ...this.piece };

    if (key === "ArrowLeft") newSelected.x--;
    else if (key === "ArrowRight") newSelected.x++;
    else if (key === "ArrowDown") newSelected.y--;
    else if (key === "ArrowUp") newSelected.orientation = (newSelected.orientation + 1) % 4;

    if (this.checkPosition(newSelected.x, newSelected.y, newSelected.orientation, pieces[newSelected.name])) this.piece = newSelected;

    this.game.sendUpdate();
  }

  representation() {
    let outputMap = JSON.parse(JSON.stringify(this.map));
    if (this.piece) {
      let targetCoords = this.getTargetCoordinates(this.piece.x, this.piece.y, this.piece.orientation, pieces[this.piece.name]);
      for (let c of targetCoords) {
        if (c[0] < 0 || c[0] > this.game.size.height || c[1] < 0 || c[1] > this.game.size.width) continue;
        outputMap[c[0]][c[1]] = "target";
      }
      let pieceCoords = this.getPieceCoordinates(this.piece.x, this.piece.y, this.piece.orientation, pieces[this.piece.name]);
      for (let c of pieceCoords) {
        if (c[0] < 0 || c[0] > this.game.size.height || c[1] < 0 || c[1] > this.game.size.width) continue;
        outputMap[c[0]][c[1]] = this.piece.name;
      }
    }

    // calculate the specter of the map
    // the specter is a copy of the map where only the highest cell of each column is kept
    // and the other cells are set to "specter"
    let specter = JSON.parse(JSON.stringify(this.map));
    for (let x = 0; x < this.game.size.width; x++) {
      let y = this.game.size.height;
      while (y >= 0 && specter[y][x] === "") y--;
      for (let i = 0; i < y; i++) specter[i][x] = "specter";
    }

    return {
      id: this.socket.id,
      name: this.name,
      score: this.score,
      map: outputMap,
      specter: specter,
      piece: this.piece,
      queue: this.game.queue.slice(this.queueIndex + 1, this.queueIndex + 7),
      gameOver: this.gameOver,
      hold: this.hold,
      lostAt: this.lostAt,
    };
  }
}
