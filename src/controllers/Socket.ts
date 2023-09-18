import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UserDashBoardActions } from './UserDashBoardActions';
import { SocketHandlers } from '../utils/SocketUtils/SocketHandlers';

type PASSED_IO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
type PASSED_SERVER = any

export class Socket {
    io:PASSED_IO
    mongo:MongoClient;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

    constructor(server: PASSED_SERVER, io:PASSED_IO, mongoClient:MongoClient){
        this.io = new Server(server, {
            cors: {
                origin:["http://localhost:3000"],
                methods:["GET", "POST"]
            },
            addTrailingSlash:false,
            transports: ['polling', 'websocket'],
        }); // Utwórz instancję serwera Socket.IO na bazie istniejącego serwera HTTP
        this.mongo = mongoClient
        this.SETUP_SOCKET()
    }

    private SETUP_SOCKET() {
        this.io.on('connect', (socket) => {
            this.socket = socket
            console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`)
            console.log(`socket connection ID: ${socket.client.id}. Connected user id is: ${socket.handshake.query.userId as string}`) // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE)
            socket.on("disconnect", (reason) => SocketHandlers.SOCKET_DISCONNECT(reason))
            // SocketHandlers.INTERVAL_ALL_FRIENDS_UPDATE(this.mongo, socket)

            // UZYTKOWNIK DOŁĄCZA DO GRUPY(POKÓJ SOCKET)
            socket.on("JOIN_GROUP_ROOM", (groupId, userId)=> SocketHandlers.JOIN_GROUP_ROOM(groupId, userId, socket, this.io, this.mongo))

            // UŻYTKOWNIK OPUSZCZA GRUPĘ ( POKÓJ SOCKET )
            socket.on("LEAVE_GROUP_ROOM", (groupId, userId)=> SocketHandlers.LEAVE_GROUP_ROOM(groupId, userId, socket, this.io, this.mongo))
            socket.on("USER_IS_ONLINE", (online_user) => SocketHandlers.USER_IS_ONLINE(online_user, socket, this.io, this.mongo))
            socket.on("USER_IS_OFFLINE", (offline_user_id) => SocketHandlers.USER_IS_OFFLINE(offline_user_id, socket, this.io, this.mongo))
        }) 
    }
    
    
}
