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
const UserDashBoardActions_1 = require("../../controllers/UserDashBoardActions");
const groupActiveUsersModify_1 = require("./fnUtils/groupActiveUsersModify");
const state_store_1 = __importDefault(require("../../state/state_store"));
class SocketHandlers {
    static SOCKET_DISCONNECT(reason) {
        console.log("user disconected");
        console.log(reason);
    }
    // DOŁĄCZANIE I OPUSZCZANIE GRUP
    //----------------------------------
    //UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY    
    static JOIN_GROUP_ROOM(groupId, userId, socket, io, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`UŻYTKOWNIK ${userId} DOŁĄCZYŁ DO POKOJU GRUPY: ${groupId}`);
            const activityChangeResult = yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("ADD_USER", userId, groupId, mongo);
            // const findUser = await getUserById(userId, mongo)
            console.log("USER ZE STANU TO:");
            console.log(state_store_1.default.user);
            // JEŻELI UDAŁO SIĘ ZMIENIĆ STATUS UŻYTKOWNIKA W GRUPIE ( DODAĆ UŻYTKOWNIKA DO ACTIVE_USERS W DOKUMENCIE GRUPY)
            if (activityChangeResult.status === 200) {
                //CZekamy aż do grupy uda się dołączyć.
                yield socket.join(groupId);
                // Emitujemy wiadomośc dla wszystkich uczestników grupy, że użytkownik o id userID dołączył do grupy.
                io.to(groupId).emit("GROUP_USER_JOIN", userId);
            }
            else if (activityChangeResult.status === 500) {
                // JEŻELI NIE UDAŁO SIĘ ZMIENIĆ STATUSU UŻYTKOWNIKA W GRUPIE
                socket.emit("SOCKET_FUNCTIONALITY_ERROR", activityChangeResult);
            }
        });
    }
    static LEAVE_GROUP_ROOM(groupId, userId, socket, io, mongo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("REMOVE_USER", userId, groupId, mongo);
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
