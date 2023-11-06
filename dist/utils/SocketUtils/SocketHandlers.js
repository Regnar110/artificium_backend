"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEND_FRIEND_REQUEST = exports.USER_IS_UNACTIVE = exports.USER_IS_ACTIVE = exports.USER_IS_OFFLINE = exports.USER_IS_ONLINE = exports.LEAVE_GROUP_ROOM = exports.JOIN_GROUP_ROOM = exports.SOCKET_DISCONNECT = exports.SocketHandlers = void 0;
const mongodb_1 = require("mongodb");
const groupActiveUsersModify_1 = require("./fnUtils/groupActiveUsersModify");
const getUserById_1 = require("../Mongo/fnUtils/getUserById");
const getCurrentActiveGroupUsers_1 = require("../Mongo/fnUtils/getCurrentActiveGroupUsers");
const ConnectMongo_1 = __importStar(require("../Mongo/ConnectMongo"));
const SocketClientsState_1 = require("../../stateManager/SocketClientsState");
class SocketHandlers {
    static SOCKET_DISCONNECT(socketId, reason) {
        (0, SocketClientsState_1.removeClient)(socketId);
        console.log("user disconected");
        console.log(reason);
    }
}
exports.SocketHandlers = SocketHandlers;
_a = SocketHandlers;
// DOŁĄCZANIE I OPUSZCZANIE GRUP
//----------------------------------
//UŻYTKOWNIK DOŁĄCZA DO POKOPJU GRUPY ( OTRZYMUJE POCZĄTKOWĄ LISTĘ ACTIVE_USERS z aktywnymi użytkownikami)
//UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY    
SocketHandlers.JOIN_GROUP_ROOM = (groupId, joining_user, socket, io) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("JOIN_GROUP_ROOM");
    const mongo = ConnectMongo_1.default.getInstance();
    const { _id } = joining_user;
    const userId = new mongodb_1.ObjectId(_id);
    const activityChangeResult = yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("ADD_USER", userId, groupId, mongo);
    // JEŻELI UDAŁO SIĘ ZMIENIĆ STATUS UŻYTKOWNIKA W GRUPIE ( DODAĆ UŻYTKOWNIKA DO ACTIVE_USERS W DOKUMENCIE GRUPY)
    if (activityChangeResult.status === 200) {
        //CZekamy aż do grupy uda się dołączyć.
        yield socket.join(groupId);
        // DO UŻYTKOWNIKA< KTÓRY DOŁĄCZA DO GRUPY ZOSTANIE ZWRÓCONA AKTUALNA LISTA AKTYWNYCH UŻYTKOWNIKÓW TEJ GRUPY!
        const active_users = yield (0, getCurrentActiveGroupUsers_1.getCurrentActiveGroupUsers)(groupId, mongo);
        socket.emit("CURRENT_ACTIVE_USERS", active_users);
        // DO INNYCH UŻYTKOWNIKÓW EMITUJEMY ŻE UŻYTKOWNIK DOŁĄCZYŁ DO GRUPY I PRZEKAZUJEMY IM JEGO OBIEKT CELEM AKTUALIZACJI STANU
        socket.broadcast.to(groupId).emit("GROUP_USER_JOIN", joining_user);
    }
    else if (activityChangeResult.status === 500) {
        // JEŻELI NIE UDAŁO SIĘ ZMIENIĆ STATUSU UŻYTKOWNIKA W GRUPIE
        socket.emit("SOCKET_FUNCTIONALITY_ERROR", activityChangeResult);
    }
});
SocketHandlers.LEAVE_GROUP_ROOM = (groupId, userId, socket, io) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("LEAVE_GROUP_ROOM");
    const mongo = ConnectMongo_1.default.getInstance();
    // TA FUNKCJA PO WYLOGOWANIU KLIENTA Z APKI GDY JEST W GRUPIE WYWOŁYWANA JEST DWA RAZY ( TYLKO PROVIDER ). PONIŻEJ TYMCZASOWE OBEJŚCIE, JEDNAK WYMAGA TO NAPRAWY
    const objectUserId = new mongodb_1.ObjectId(userId);
    yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("REMOVE_USER", objectUserId, groupId, mongo);
    const leaving_user = yield (0, getUserById_1.getUserById)(objectUserId, mongo);
    // TU EMITUJEMY CAŁY OBIEKT UŻYTKOWNIKA. MA TO NA CELU UMOŻLIWIENIE POINFORMOWANIA INNYCH UŻYTKOWNIKÓW OTYM KTO OPUŚCIŁ GRUPĘ I WYŚWIETLENIE KOMUNIKATU W UI
    socket.broadcast.to(groupId).emit("GROUP_USER_LEAVE", leaving_user);
    yield socket.leave(groupId);
});
// OBSŁUGA STATUSÓW UŻYTKOWNIKÓW - ONLINE I OFFLINE
// GDY UŻYTKOWNIK LOGUJE SIĘ I JEST ONLINE WYSYŁA DO TEJ METODY SWÓJ OBIEKT.
// Z TEGO OBIEKTU SPRAWDZAMY JACY UŻYTKOWNICY Z FRIENDLISTY LOGUJĄCEGO SIĘ USERA SĄ ONLINE I INFORMUJEMY ICH ŻE TEN USER JEST ONLINE
SocketHandlers.USER_IS_ONLINE = (online_user_id, user_friends, socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("USER_IS_ONLINE");
    const mongo = ConnectMongo_1.default.getInstance();
    //POTRZEBNE : TABLICA PRZYJACIÓŁ USERA ONLINE, JEGO ID
    const collection = mongo.db("Artificium").collection("Users");
    const online_user = yield collection.findOne({ _id: new mongodb_1.ObjectId(online_user_id) });
    const user_frineds_Objected = user_friends.map(friend => new mongodb_1.ObjectId(friend));
    const friendsOnline = yield collection.find({ _id: { $in: user_frineds_Objected }, isOnline: true }, { projection: { _id: 1 } }).toArray();
    friendsOnline.forEach(friend => socket.broadcast.emit(`${friend._id}_USER_IS_ONLINE`, online_user));
});
// GDY UŻYTKOWNIK WYLOGOWUJE SIĘ Z APLIKACJI WYSYŁAMY DO TEJ METODY ID UŻYTKOWNIKA KTÓRY OPUSZCZA APLIKACJE
// NASTĘPNIE SPRAWDZAMY JACY JEGO ZNAJOMI SĄ ONLINE I DO KAŻDEGO Z NICH WYSYŁAMY INFORMACJĘ ŻE UŻYTKOWNIK O WSKAZANYM ID OPUŚCIŁ APLIKACJĘ ( WYLOGOWAŁ SIĘ )
SocketHandlers.USER_IS_OFFLINE = (offline_user_id, user_friends, socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("USER_IS_OFFLINE");
    const offline_user = yield (0, ConnectMongo_1.db_collection)("Users").findOne({ _id: new mongodb_1.ObjectId(offline_user_id) });
    const objected_user_friends = user_friends.map((friend_id) => {
        console.log(friend_id);
        return new mongodb_1.ObjectId(friend_id);
    });
    const online_user_friends = yield (0, ConnectMongo_1.db_collection)("Users").find({ _id: { $in: objected_user_friends } }, { projection: { _id: 1 } }).toArray();
    online_user_friends.forEach(friend => socket.broadcast.emit(`${friend._id.toString()}_USER_IS_OFFLINE`, offline_user));
});
SocketHandlers.USER_IS_UNACTIVE = (unactive_user_id, user_friends, groupId, socket, io) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("USER IS UNACTIVE!!!!");
    _a.USER_IS_OFFLINE(unactive_user_id, user_friends, socket);
    groupId && _a.LEAVE_GROUP_ROOM(groupId, unactive_user_id, socket, io);
    (0, ConnectMongo_1.db_collection)("Users").updateOne({ _id: new mongodb_1.ObjectId(unactive_user_id) }, { $set: { "isInactive": true } });
});
SocketHandlers.USER_IS_ACTIVE = (active_user_id, user_friends, socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("USER IS ACTIVE CALL");
    console.log(active_user_id);
    //SPrawdzamy czy pole dokumentu użytkownika isInactive jest true.
    // Oznaczałoby to że użytkownik jest ONLINE, ale jest nieaktywny.
    const { isInactive } = yield (0, ConnectMongo_1.db_collection)("Users").findOne({ _id: new mongodb_1.ObjectId(active_user_id) }, { projection: { _id: 0, isInactive: 1 } });
    //JEŻELI UŻYTKOWNIK FAJKTYCZNIE BYŁ NIEAKTYWNY( WYSZEDŁ Z APPKI PRZEZ AMKNIĘCIE NP OKNA, BEZ RZECZYWISTEGO WYLOGOWANIA SIĘ )
    if (isInactive === true) {
        // zmieniamy stan pola isInactive dokumentu użytkownika na false bo użytkownik już wrócił do aplikacji
        (0, ConnectMongo_1.db_collection)("Users").updateOne({ _id: new mongodb_1.ObjectId(active_user_id) }, { $set: { "isInactive": false } });
        // emitujemy do jego znajomych że już wrócił
        _a.USER_IS_ONLINE(active_user_id, user_friends, socket);
    }
});
SocketHandlers.SEND_FRIEND_REQUEST = (fromId, toId, socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(fromId);
    console.log(toId);
    //ID socket'u do którego będziemy emitować wiadomość zwrotną o otrzymaniu nowego friendRequesta
    const socketClient = (0, SocketClientsState_1.findClient)(toId);
    //Obiekt, który będziemy umieszczali w mongoDb oraz wysyłali do klienta, który miał dostać prośbę o dołączenie do znajomych
    const FriendRequestObject = {
        fromId,
        system_type: "friend_request",
        topic: "Friend Request",
        content: "Hello! I would like you to join my group of friends. This would make it easier gor us to establish and maintain contact. Consider my request."
    };
    //Umieszczamy obiekt w bazie maili konkretnego użytkownika
    yield (0, ConnectMongo_1.db_collection)("Mailboxes").updateOne({ ownerId: toId }, { $push: { mails: FriendRequestObject } });
    //Następnie sprawdzamy czy użytkownik jest obecnie online. 
    const { isOnline } = yield (0, ConnectMongo_1.db_collection)("Users").findOne({ _id: new mongodb_1.ObjectId(toId) });
    if (isOnline && socketClient) {
        // Jeżeli tak emitujemy mu wiadomosć o nowym mailu.{
        console.log("TARGET USER IS ONLINE");
        console.log(socketClient);
        socket.broadcast.emit("INCOMING_FRIEND_REQUEST", "NADCHODZĄCY FR OD", FriendRequestObject);
    }
    else {
        // Jeżeli nie nie robimy nic po za umieszczeniem maila w bazie. Użytkownik będzie mógł go odczytać później. 
        console.log("TARGET USER IS OFFLINE");
    }
});
exports.SOCKET_DISCONNECT = SocketHandlers.SOCKET_DISCONNECT, exports.JOIN_GROUP_ROOM = SocketHandlers.JOIN_GROUP_ROOM, exports.LEAVE_GROUP_ROOM = SocketHandlers.LEAVE_GROUP_ROOM, exports.USER_IS_ONLINE = SocketHandlers.USER_IS_ONLINE, exports.USER_IS_OFFLINE = SocketHandlers.USER_IS_OFFLINE, exports.USER_IS_ACTIVE = SocketHandlers.USER_IS_ACTIVE, exports.USER_IS_UNACTIVE = SocketHandlers.USER_IS_UNACTIVE, exports.SEND_FRIEND_REQUEST = SocketHandlers.SEND_FRIEND_REQUEST;
