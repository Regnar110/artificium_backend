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
exports.SocketHandlers = void 0;
const mongodb_1 = require("mongodb");
const groupActiveUsersModify_1 = require("./fnUtils/groupActiveUsersModify");
const getUserById_1 = require("../Mongo/fnUtils/getUserById");
const getCurrentActiveGroupUsers_1 = require("../Mongo/fnUtils/getCurrentActiveGroupUsers");
const ConnectMongo_1 = __importDefault(require("../Mongo/ConnectMongo"));
class SocketHandlers {
    static SOCKET_DISCONNECT(reason) {
        console.log("user disconected");
        console.log(reason);
    }
    // DOŁĄCZANIE I OPUSZCZANIE GRUP
    //----------------------------------
    //UŻYTKOWNIK DOŁĄCZA DO POKOPJU GRUPY ( OTRZYMUJE POCZĄTKOWĄ LISTĘ ACTIVE_USERS z aktywnymi użytkownikami)
    //UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY    
    static JOIN_GROUP_ROOM(groupId, joining_user, socket, io, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
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
    }
    static LEAVE_GROUP_ROOM(groupId, userId, socket, io, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("LEAVE_GROUP_ROOM");
            const mongo2 = ConnectMongo_1.default.getInstance();
            // TA FUNKCJA PO WYLOGOWANIU KLIENTA Z APKI GDY JEST W GRUPIE WYWOŁYWANA JEST DWA RAZY ( TYLKO PROVIDER ). PONIŻEJ TYMCZASOWE OBEJŚCIE, JEDNAK WYMAGA TO NAPRAWY
            const objectUserId = new mongodb_1.ObjectId(userId);
            yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("REMOVE_USER", objectUserId, groupId, mongo);
            const leaving_user = yield (0, getUserById_1.getUserById)(objectUserId, mongo2);
            // TU EMITUJEMY CAŁY OBIEKT UŻYTKOWNIKA. MA TO NA CELU UMOŻLIWIENIE POINFORMOWANIA INNYCH UŻYTKOWNIKÓW OTYM KTO OPUŚCIŁ GRUPĘ I WYŚWIETLENIE KOMUNIKATU W UI
            io.to(groupId).emit("GROUP_USER_LEAVE", leaving_user);
            yield socket.leave(groupId);
        });
    }
    // OBSŁUGA STATUSÓW UŻYTKOWNIKÓW - ONLINE I OFFLINE
    // GDY UŻYTKOWNIK LOGUJE SIĘ I JEST ONLINE WYSYŁA DO TEJ METODY SWÓJ OBIEKT.
    // Z TEGO OBIEKTU SPRAWDZAMY JACY UŻYTKOWNICY Z FRIENDLISTY LOGUJĄCEGO SIĘ USERA SĄ ONLINE I INFORMUJEMY ICH ŻE TEN USER JEST ONLINE
    static USER_IS_ONLINE(online_user_id, user_friends, socket, io, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
            const mongo2 = ConnectMongo_1.default.getInstance();
            //POTRZEBNE : TABLICA PRZYJACIÓŁ USERA ONLINE, JEGO ID
            const collection = mongo2.db("Artificium").collection("Users");
            const user_frineds_Objected = user_friends.map(friend => new mongodb_1.ObjectId(friend));
            const friendsOnline = yield collection.find({ _id: { $in: user_frineds_Objected }, isOnline: true }, { projection: { _id: 1 } }).toArray();
            friendsOnline.forEach(friend => socket.broadcast.emit(`${friend._id}_USER_IS_ONLINE`, online_user_id));
        });
    }
    // GDY UŻYTKOWNIK WYLOGOWUJE SIĘ Z APLIKACJI WYSYŁAMY DO TEJ METODY ID UŻYTKOWNIKA KTÓRY OPUSZCZA APLIKACJE
    // NASTĘPNIE SPRAWDZAMY JACY JEGO ZNAJOMI SĄ ONLINE I DO KAŻDEGO Z NICH WYSYŁAMY INFORMACJĘ ŻE UŻYTKOWNIK O WSKAZANYM ID OPUŚCIŁ APLIKACJĘ ( WYLOGOWAŁ SIĘ )
    static USER_IS_OFFLINE(offline_user_id, user_friends, socket, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("USER_IS_OFFLINE");
            const mongo2 = ConnectMongo_1.default.getInstance();
            const collection = mongo2.db("Artificium").collection("Users");
            const objected_user_friends = user_friends.map((friend_id) => {
                console.log(friend_id);
                return new mongodb_1.ObjectId(friend_id);
            });
            console.log(objected_user_friends);
            const online_user_friends = yield collection.find({ _id: { $in: objected_user_friends } }, { projection: { _id: 1 } }).toArray();
            online_user_friends.forEach(friend => socket.broadcast.emit(`${friend._id.toString()}_USER_IS_OFFLINE`, offline_user_id));
        });
    }
    static USER_IS_UNACTIVE(unactive_user_id, user_friends, groupId, socket, io, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("USER IS UNACTIVE!!!!");
            this.USER_IS_OFFLINE(unactive_user_id, user_friends, socket, mongo);
            groupId && this.LEAVE_GROUP_ROOM(groupId, unactive_user_id, socket, io, mongo);
        });
    }
}
exports.SocketHandlers = SocketHandlers;
