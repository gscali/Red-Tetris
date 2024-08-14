import { expect } from "chai";
import sinon from "sinon";
import { choice } from "../src/utils.js";

describe("utils", () => {
  it("choice should return a random element from an array", () => {
    const arr = [1, 2, 3, 4, 5];
    sinon.stub(Math, "random").returns(0.5);
    expect(choice(arr)).to.equal(3);
  });
});
