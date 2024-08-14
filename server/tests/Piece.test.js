import { expect } from "chai";
import { Piece, pieces } from "../src/classes/Piece.js";

describe("Piece", () => {
  it("should create a new Piece with the correct properties", () => {
    const piece = new Piece("TestPiece", [
      [1, 1],
      [1, 1],
    ]);
    expect(piece).to.have.property("name", "TestPiece");
    expect(piece).to.have.property("shape").that.is.an("array");
    expect(piece.shape).to.deep.equal([
      [1, 1],
      [1, 1],
    ]);
  });
});

describe("pieces", () => {
  it("should be an object with the correct keys", () => {
    expect(pieces).to.be.an("object");
    expect(pieces).to.have.all.keys("I", "O", "T", "S", "Z", "J", "L", "barbate");
  });

  it("should have arrays as values", () => {
    for (let key in pieces) {
      expect(pieces[key]).to.be.an("array");
    }
  });
});
