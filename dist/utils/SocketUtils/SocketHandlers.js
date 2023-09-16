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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketHandlers = void 0;
const UserDashBoardActions_1 = require("../../controllers/UserDashBoardActions");
const mongodb_1 = require("mongodb");
const groupActiveUsersModify_1 = require("./fnUtils/groupActiveUsersModify");
const getCurrentActiveGroupUsers_1 = require("../Mongo/fnUtils/getCurrentActiveGroupUsers");
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
            console.log("JOIN_GROUP_ROOM");
            console.log(`GROUP: ${groupId}`);
            console.log(joining_user);
            const { _id } = joining_user;
            const userId = new mongodb_1.ObjectId(_id);
            console.log(`USER ID TO ${userId} - TU JEST BŁĄD???`);
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
            // TA FUNKCJA PO WYLOGOWANIU KLIENTA Z APKI GDY JEST W GRUPIE WYWOŁYWANA JEST DWA RAZY ( TYLKO PROVIDER ). PONIŻEJ TYMCZASOWE OBEJŚCIE, JEDNAK WYMAGA TO NAPRAWY
            const objectUserId = new mongodb_1.ObjectId(userId);
            console.log("LEAVE_GROUP_ROOM");
            console.log(userId);
            yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("REMOVE_USER", objectUserId, groupId, mongo);
            // Tu emitujemy tylko userID bez obiektu użytkownika. Na bazie tego id będziemy go usuwali z grupy i dawali znać klientowi że obiekt z polem _id === userID będzie usuwany.
            io.to(groupId).emit("GROUP_USER_LEAVE", userId);
            yield socket.leave(groupId);
            console.log(`UŻYTKOWNIK ${userId} OPUSZCZA POKÓJ GRUPY: ${groupId}`);
        });
    }
    // LOGOWANIE I WYLOGOWYWANIE ZNAJOMYCH - BEZ PODZIAŁU NA GRUPY!
    // ZWRACAMY UŻYTKOWNIKOWI CO 10 SEKUND AKTUALNĄ WARTOŚĆ JEGO ZNAJOMYCH
    static INTERVAL_ALL_FRIENDS_UPDATE(mongoDb, socket) {
        const artificium_db = mongoDb.db("Artificium");
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const lookedFriends = yield UserDashBoardActions_1.UserDashBoardActions.getUserFriends(socket.handshake.query.userId, artificium_db);
                socket.emit("chat", lookedFriends);
            }
            catch (error) {
            }
        }), 10000);
    }
}
exports.SocketHandlers = SocketHandlers;
