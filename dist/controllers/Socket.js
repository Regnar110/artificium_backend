"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const SocketHandlers_1 = require("../utils/SocketUtils/SocketHandlers");
class Socket {
    constructor(server, io, mongoClient) {
        this.io = io;
        // this.io = new Server(server, {
        //     cors: {
        //         origin:["http://localhost:3000"],
        //         methods:["GET", "POST"]
        //     },
        //     addTrailingSlash:false,
        //     transports: ['polling', 'websocket'],
        // }); // Utwórz instancję serwera Socket.IO na bazie istniejącego serwera HTTP
        this.mongo = mongoClient;
        this.SETUP_SOCKET();
    }
    SETUP_SOCKET() {
        this.io.on('connect', (socket) => {
            this.socket = socket;
            console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`);
            console.log(`socket connection ID: ${socket.client.id}. Connected user id is: ${socket.handshake.query.userId}`); // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE)
            socket.on("disconnect", (reason) => SocketHandlers_1.SocketHandlers.SOCKET_DISCONNECT(reason));
            // SocketHandlers.INTERVAL_ALL_FRIENDS_UPDATE(this.mongo, socket)
            // UZYTKOWNIK DOŁĄCZA DO GRUPY(POKÓJ SOCKET)
            socket.on("JOIN_GROUP_ROOM", (groupId, userId) => SocketHandlers_1.SocketHandlers.JOIN_GROUP_ROOM(groupId, userId, socket, this.io, this.mongo));
            // UŻYTKOWNIK OPUSZCZA GRUPĘ ( POKÓJ SOCKET )
            socket.on("LEAVE_GROUP_ROOM", (groupId, userId) => SocketHandlers_1.SocketHandlers.LEAVE_GROUP_ROOM(groupId, userId, socket, this.io, this.mongo));
            socket.on("USER_IS_ONLINE", (online_user_id, user_friends) => SocketHandlers_1.SocketHandlers.USER_IS_ONLINE(online_user_id, user_friends, socket));
            socket.on("USER_IS_OFFLINE", (offline_user_id, user_friends) => SocketHandlers_1.SocketHandlers.USER_IS_OFFLINE(offline_user_id, user_friends, socket));
            socket.on("USER_IS_UNACTIVE", (unactive_user_id, user_friends, groupId) => SocketHandlers_1.SocketHandlers.USER_IS_UNACTIVE(unactive_user_id, user_friends, groupId, socket, this.io, this.mongo));
            socket.on("USER_IS_ACTIVE", (active_user_id, user_friends) => SocketHandlers_1.SocketHandlers.USER_IS_ACTIVE(active_user_id, user_friends, socket, this.io, this.mongo));
        });
    }
}
exports.Socket = Socket;
