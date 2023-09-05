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
const groupActiveUsersModify_1 = require("./fnUtils/groupActiveUsersModify");
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
            yield (0, groupActiveUsersModify_1.groupActiveUsersModify)("ADD_USER", userId, groupId, mongo);
            //CZekamy aż do grupy uda się dołączyć.
            // TUTAJ MUSIMY OGARNĄĆ LOGIKĘ ZWIĄZANĄ Z DODANIEM DO KONKRTNEGO DOKUENTU GRUPY ID UŻYTKOWNIKA W POLU ACTIVE USERS
            yield socket.join(groupId);
            // Emitujemy wiadomośc dla wszystkich uczestników grupy, że użytkownik o id userID dołączył do grupy.
            io.to(groupId).emit("GROUP_USER_JOIN", userId); // TU BĘDZIEMY ZWRACAĆ OBIEKT UŻYTKOWNIKA< KTÓRY ŚWIEŻO DOŁĄCZYŁ DO GRUPY CELEM UMOŻLIWNIE APOZOSTAŁYM ZAKTUALIZOWANIE SWOJEJ LISTY UZYTKONIKÓW W GRUPIE
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
