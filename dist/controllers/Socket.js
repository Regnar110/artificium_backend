"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class Socket {
    constructor() {
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: ["http://localhost:3000"],
                methods: ["GET", "POST"]
            },
            addTrailingSlash: false,
            transports: ['polling', 'websocket'],
        });
    }
}
