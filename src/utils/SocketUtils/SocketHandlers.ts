import { DisconnectReason, Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { UserDashBoardActions } from "../../controllers/UserDashBoardActions"
import { MongoClient, ObjectId } from "mongodb"
import { groupActiveUsersModify } from "./fnUtils/groupActiveUsersModify"

type SOCKET = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
type IO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export class SocketHandlers {

    static SOCKET_DISCONNECT(reason: DisconnectReason) {
        console.log("user disconected")
        console.log(reason)
    }

    // DOŁĄCZANIE I OPUSZCZANIE GRUP
    //----------------------------------
    //UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY    
    static async JOIN_GROUP_ROOM(groupId:string, userId:string, socket:SOCKET, io:IO, mongo:MongoClient) {
        console.log(`UŻYTKOWNIK ${userId} DOŁĄCZYŁ DO POKOJU GRUPY: ${groupId}`)
        await groupActiveUsersModify("ADD_USER", userId, groupId, mongo)
        //CZekamy aż do grupy uda się dołączyć.
        // TUTAJ MUSIMY OGARNĄĆ LOGIKĘ ZWIĄZANĄ Z DODANIEM DO KONKRTNEGO DOKUENTU GRUPY ID UŻYTKOWNIKA W POLU ACTIVE USERS
        
        await socket.join(groupId)
        // Emitujemy wiadomośc dla wszystkich uczestników grupy, że użytkownik o id userID dołączył do grupy.


        io.to(groupId).emit("GROUP_USER_JOIN", userId); // TU BĘDZIEMY ZWRACAĆ OBIEKT UŻYTKOWNIKA< KTÓRY ŚWIEŻO DOŁĄCZYŁ DO GRUPY CELEM UMOŻLIWNIE APOZOSTAŁYM ZAKTUALIZOWANIE SWOJEJ LISTY UZYTKONIKÓW W GRUPIE

    }

    static async LEAVE_GROUP_ROOM(groupId:string, userId:string, socket:SOCKET, io:IO, mongo:MongoClient) {
        await groupActiveUsersModify("REMOVE_USER", userId, groupId, mongo)
        io.to(groupId).emit("GROUP_USER_LEAVE", userId)
        await socket.leave(groupId)
        console.log(`UŻYTKOWNIK ${userId} OPUSZCZA POKÓJ GRUPY: ${groupId}`)
    }
            
    // LOGOWANIE I WYLOGOWYWANIE ZNAJOMYCH - BEZ PODZIAŁU NA GRUPY!
    // ZWRACAMY UŻYTKOWNIKOWI CO 10 SEKUND AKTUALNĄ WARTOŚĆ JEGO ZNAJOMYCH
    static INTERVAL_ALL_FRIENDS_UPDATE(mongoDb:MongoClient, socket:SOCKET) {
    const artificium_db = mongoDb.db("Artificium")
        setInterval(async () => { // EMITY Co 10 sekund do klienta
            try {
                const lookedFriends = await UserDashBoardActions.getUserFriends(socket.handshake.query.userId as string, artificium_db)
                socket.emit("chat", lookedFriends)
            } catch (error) {
                
            }            
        },10000)       
    }

}