import dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { JOIN_GROUP_ROOM, LEAVE_GROUP_ROOM, SOCKET_DISCONNECT, USER_IS_ACTIVE, USER_IS_OFFLINE, USER_IS_ONLINE, USER_IS_UNACTIVE } from '../utils/SocketUtils/SocketHandlers';

export class SocketIO {
    io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | undefined
    constructor(http_server:http.Server){
        this.io = new Server(http_server, {
            cors: {origin:["http://localhost:3000"], methods:["GET", "POST"]},
            addTrailingSlash:false,
            transports: ['polling', 'websocket'],
        });
        this.SETUP_SOCKET()
    }

    private SETUP_SOCKET() {
        this.io.on('connect', (socket) => {
            this.socket = socket
            console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`)
            //socket.client.id -- ID POŁĄCZONEGO SOCKETU KLIENTA
            console.log(`Connected user id is: ${socket.handshake.query.userId as string}`) // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE)
            socket.on("disconnect", (reason) => SOCKET_DISCONNECT(reason))

            // UZYTKOWNIK DOŁĄCZA DO GRUPY(POKÓJ SOCKET)
            socket.on("JOIN_GROUP_ROOM", (groupId, userId)=> JOIN_GROUP_ROOM(groupId, userId, socket, this.io))

            // UŻYTKOWNIK OPUSZCZA GRUPĘ ( POKÓJ SOCKET )
            socket.on("LEAVE_GROUP_ROOM", (groupId, userId)=> LEAVE_GROUP_ROOM(groupId, userId, socket, this.io))

            // UZYTKOWNIK JES ONLINE/OFFLINE
            socket.on("USER_IS_ONLINE", (online_user_id, user_friends) => USER_IS_ONLINE(online_user_id, user_friends, socket))
            socket.on("USER_IS_OFFLINE", async (offline_user_id, user_friends) => USER_IS_OFFLINE(offline_user_id, user_friends, socket))

            // UŻYTKOWNIK JEST NIEAKTYWNY / AKTYWNY
            socket.on("USER_IS_UNACTIVE", (unactive_user_id, user_friends, groupId) => USER_IS_UNACTIVE(unactive_user_id, user_friends, groupId, socket, this.io))
            socket.on("USER_IS_ACTIVE", (active_user_id, user_friends) => USER_IS_ACTIVE(active_user_id, user_friends, socket))
        }) 
    }
    
    
}

