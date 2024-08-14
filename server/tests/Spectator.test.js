import { expect } from "chai";
import sinon from "sinon";
import { Socket } from "socket.io";
import { Spectator } from "../src/classes/Spectator.js";

describe("Spectator", () => {
  let mockSocket;
  let spectator;

  beforeEach(() => {
    mockSocket = sinon.createStubInstance(Socket);
    spectator = new Spectator("TestSpectator", mockSocket);
  });

  it("spectator name should be TestSpectator", () => expect(spectator.name).to.equal("TestSpectator"));
  it("spectator socket should be mockSocket", () => expect(spectator.socket).to.equal(mockSocket));
});
