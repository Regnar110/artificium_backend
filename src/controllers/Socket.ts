import dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { INCOMING_ACCEPT_FR, INCOMING_REJECT_FR, JOIN_GROUP_ROOM, LEAVE_GROUP_ROOM, SEND_FRIEND_REQUEST, SOCKET_DISCONNECT, USER_IS_ACTIVE, USER_IS_OFFLINE, USER_IS_ONLINE, USER_IS_UNACTIVE } from '../utils/SocketUtils/SocketHandlers';
import SocketClientState from '../stateManager/SocketClientsState';

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

            // Dodajemy obiekt klienta do globalnego stanu serwera celem umożliwienia późniejszego rozponania relacji konkretnego użytkownika z połączonym socketem - szczególnie używane
            // w kontekście umożliwienia "roomless" połączeń użytkowników
            SocketClientState.addClient({userId:socket.handshake.query.userId as string, socketId:socket.id})
            
            console.log(`Connected user id is: ${socket.handshake.query.userId as string}`) // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE)
            socket.on("disconnect", (reason) => SOCKET_DISCONNECT(socket.id, reason))

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

            // UZYTKOWNIK WYSYŁA ZAPROSZENIE DO GRONA ZNAJOMYCH
            socket.on("SEND_FRIEND_REQUEST", (fromId, fromNickName, email, toId) => SEND_FRIEND_REQUEST(fromId, fromNickName, email, toId, this.io, socket))
            
            // ODPOWIEDZI NA FR
            socket.on("INCOMING_ACCEPT_FR", (mail_id, fromId, fromUserNick, toId) => INCOMING_ACCEPT_FR(mail_id, fromId, fromUserNick, toId))
            socket.on("INCOMING_REJECT_FR", (mail_id, fromId, fromUserNick, toId) => INCOMING_REJECT_FR(mail_id, fromId, fromUserNick, toId))
        }) 
    
    
    
}

