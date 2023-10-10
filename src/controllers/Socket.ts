import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { JOIN_GROUP_ROOM, LEAVE_GROUP_ROOM, SOCKET_DISCONNECT, SocketHandlers, USER_IS_ACTIVE, USER_IS_OFFLINE, USER_IS_ONLINE, USER_IS_UNACTIVE } from '../utils/SocketUtils/SocketHandlers';


type PASSED_IO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>


export class SocketIO {
    io:PASSED_IO
    mongo:MongoClient;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | undefined
    constructor(io:PASSED_IO, mongoClient:MongoClient){
        this.io = io
        this.mongo = mongoClient
        this.SETUP_SOCKET()
    }

    private SETUP_SOCKET() {
        this.io.on('connect', (socket) => {
            this.socket = socket
            console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`)
            console.log(`socket connection ID: ${socket.client.id}. Connected user id is: ${socket.handshake.query.userId as string}`) // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE)
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
            socket.on("USER_IS_ACTIVE", (active_user_id, user_friends) => USER_IS_ACTIVE(active_user_id, user_friends, socket, this.io, this.mongo))
        }) 
    }
    
    
}

