import { Socket } from "socket.io";

export class Spectator {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
  }
}
