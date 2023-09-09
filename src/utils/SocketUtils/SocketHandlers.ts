import { DisconnectReason, Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { UserDashBoardActions } from "../../controllers/UserDashBoardActions"
import { MongoClient, ObjectId } from "mongodb"
import { groupActiveUsersModify } from "./fnUtils/groupActiveUsersModify"
import { getUserById } from "../Mongo/fnUtils/getUserById"
import STATE_STORE from "../../state/state_store"

type SOCKET = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
type IO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export class SocketHandlers {

    static SOCKET_DISCONNECT(reason: DisconnectReason) {
        console.log("user disconected")
        console.log(reason)
    }

    // DOŁĄCZANIE I OPUSZCZANIE GRUP
    //----------------------------------

    //UŻYTKOWNIK DOŁĄCZA DO POKOPJU GRUPY ( OTRZYMUJE POCZĄTKOWĄ LISTĘ ACTIVE_USERS z aktywnymi użytkownikami)



    //UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY    
    static async JOIN_GROUP_ROOM(groupId:string, userId:string, socket:SOCKET, io:IO, mongo:MongoClient) {
        console.log(`UŻYTKOWNIK ${userId} DOŁĄCZYŁ DO POKOJU GRUPY: ${groupId}`)
        const activityChangeResult = await groupActiveUsersModify("ADD_USER", userId, groupId, mongo)
        // const findUser = await getUserById(userId, mongo)
        // JEŻELI UDAŁO SIĘ ZMIENIĆ STATUS UŻYTKOWNIKA W GRUPIE ( DODAĆ UŻYTKOWNIKA DO ACTIVE_USERS W DOKUMENCIE GRUPY)
        if(activityChangeResult.status===200){
            
            //CZekamy aż do grupy uda się dołączyć.
            await socket.join(groupId)

            // Emitujemy wiadomośc dla wszystkich uczestników grupy, że użytkownik o id userID dołączył do grupy. NIE POWINNA DOCHODZIĆ DO WYSYŁAJĄCEGO.
            io.to(groupId).emit("GROUP_USER_JOIN", STATE_STORE.user)

        } else if(activityChangeResult.status===500) {

            // JEŻELI NIE UDAŁO SIĘ ZMIENIĆ STATUSU UŻYTKOWNIKA W GRUPIE
            socket.emit("SOCKET_FUNCTIONALITY_ERROR", activityChangeResult as ErrorResponseType)
        }
        

    }

    static async LEAVE_GROUP_ROOM(groupId:string, userId:string, socket:SOCKET, io:IO, mongo:MongoClient) {
        await groupActiveUsersModify("REMOVE_USER", userId, groupId, mongo)

        // Tu emitujemy tylko userID bez obiektu użytkownika. Na bazie tego id będziemy go usuwali z grupy i dawali znać klientowi że obiekt z polem _id === userID będzie usuwany.
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