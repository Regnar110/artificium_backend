import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

class Socket {
    readonly io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

    constructor() {
        this.io = new Server(this.server, {
            cors: {
                origin:["http://localhost:3000"],
                methods:["GET", "POST"]
            },
            addTrailingSlash:false,
            transports: ['polling', 'websocket'],
          });
    }
}