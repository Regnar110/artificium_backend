"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIO = void 0;
const socket_io_1 = require("socket.io");
const SocketHandlers_1 = require("../utils/SocketUtils/SocketHandlers");
const SocketClientsState_1 = __importDefault(require("../stateManager/SocketClientsState"));
class SocketIO {
    constructor(http_server) {
        this.io = new socket_io_1.Server(http_server, {
            cors: { origin: ["http://localhost:3000"], methods: ["GET", "POST"] },
            addTrailingSlash: false,
            transports: ['polling', 'websocket'],
        });
        this.SETUP_SOCKET();
    }
    SETUP_SOCKET() {
        this.io.on('connect', (socket) => {
            this.socket = socket;
            console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`);
            // Dodajemy obiekt klienta do globalnego stanu serwera celem umożliwienia późniejszego rozponania relacji konkretnego użytkownika z połączonym socketem - szczególnie używane
            // w kontekście umożliwienia "roomless" połączeń użytkowników
            SocketClientsState_1.default.addClient({ userId: socket.handshake.query.userId, socketId: socket.id });
            console.log(`Connected user id is: ${socket.handshake.query.userId}`); // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE)
            socket.on("disconnect", (reason) => (0, SocketHandlers_1.SOCKET_DISCONNECT)(socket.id, reason));
            // UZYTKOWNIK DOŁĄCZA DO GRUPY(POKÓJ SOCKET)
            socket.on("JOIN_GROUP_ROOM", (groupId, userId) => (0, SocketHandlers_1.JOIN_GROUP_ROOM)(groupId, userId, socket, this.io));
            // UŻYTKOWNIK OPUSZCZA GRUPĘ ( POKÓJ SOCKET )
            socket.on("LEAVE_GROUP_ROOM", (groupId, userId) => (0, SocketHandlers_1.LEAVE_GROUP_ROOM)(groupId, userId, socket, this.io));
            // UZYTKOWNIK JES ONLINE/OFFLINE
            socket.on("USER_IS_ONLINE", (online_user_id, user_friends) => (0, SocketHandlers_1.USER_IS_ONLINE)(online_user_id, user_friends, socket));
            socket.on("USER_IS_OFFLINE", (offline_user_id, user_friends) => __awaiter(this, void 0, void 0, function* () { return (0, SocketHandlers_1.USER_IS_OFFLINE)(offline_user_id, user_friends, socket); }));
            // UŻYTKOWNIK JEST NIEAKTYWNY / AKTYWNY
            socket.on("USER_IS_UNACTIVE", (unactive_user_id, user_friends, groupId) => (0, SocketHandlers_1.USER_IS_UNACTIVE)(unactive_user_id, user_friends, groupId, socket, this.io));
            socket.on("USER_IS_ACTIVE", (active_user_id, user_friends) => (0, SocketHandlers_1.USER_IS_ACTIVE)(active_user_id, user_friends, socket));
            // UZYTKOWNIK WYSYŁA ZAPROSZENIE DO GRONA ZNAJOMYCH
            socket.on("SEND_FRIEND_REQUEST", (fromId, toId) => (0, SocketHandlers_1.SEND_FRIEND_REQUEST)(fromId, toId, socket));
        });
    }
}
exports.SocketIO = SocketIO;
