import { DisconnectReason, Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { UserDashBoardActions } from "../../controllers/UserDashBoardActions"
import { MongoClient, ObjectId } from "mongodb"
import { groupActiveUsersModify } from "./fnUtils/groupActiveUsersModify"
import { getUserById } from "../Mongo/fnUtils/getUserById"
import { UserMongoDocument } from "../../globalTypings/userMongoDocument"
import { getCurrentActiveGroupUsers } from "../Mongo/fnUtils/getCurrentActiveGroupUsers"

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
    static async JOIN_GROUP_ROOM(groupId:string, joining_user:UserMongoDocument, socket:SOCKET, io:IO, mongo:MongoClient) {
        const {_id } = joining_user
        const userId = new ObjectId(_id)
        const activityChangeResult = await groupActiveUsersModify("ADD_USER", userId , groupId, mongo)

        // JEŻELI UDAŁO SIĘ ZMIENIĆ STATUS UŻYTKOWNIKA W GRUPIE ( DODAĆ UŻYTKOWNIKA DO ACTIVE_USERS W DOKUMENCIE GRUPY)
        if(activityChangeResult.status===200){
            
            //CZekamy aż do grupy uda się dołączyć.
            await socket.join(groupId)

            // DO UŻYTKOWNIKA< KTÓRY DOŁĄCZA DO GRUPY ZOSTANIE ZWRÓCONA AKTUALNA LISTA AKTYWNYCH UŻYTKOWNIKÓW TEJ GRUPY!
            const active_users = await getCurrentActiveGroupUsers(groupId, mongo)
            socket.emit("CURRENT_ACTIVE_USERS", active_users) 

            // DO INNYCH UŻYTKOWNIKÓW EMITUJEMY ŻE UŻYTKOWNIK DOŁĄCZYŁ DO GRUPY I PRZEKAZUJEMY IM JEGO OBIEKT CELEM AKTUALIZACJI STANU
            socket.broadcast.to(groupId).emit("GROUP_USER_JOIN", joining_user)

        } else if(activityChangeResult.status===500) {

            // JEŻELI NIE UDAŁO SIĘ ZMIENIĆ STATUSU UŻYTKOWNIKA W GRUPIE
            socket.emit("SOCKET_FUNCTIONALITY_ERROR", activityChangeResult as ErrorResponseType)
        }
        

    }

    static async LEAVE_GROUP_ROOM(groupId:string, userId:string, socket:SOCKET, io:IO, mongo:MongoClient) {
        console.log("LEAVE GROUP ROOM HIT")
        // TA FUNKCJA PO WYLOGOWANIU KLIENTA Z APKI GDY JEST W GRUPIE WYWOŁYWANA JEST DWA RAZY ( TYLKO PROVIDER ). PONIŻEJ TYMCZASOWE OBEJŚCIE, JEDNAK WYMAGA TO NAPRAWY
            const objectUserId = new ObjectId(userId)
            await groupActiveUsersModify("REMOVE_USER", objectUserId, groupId, mongo)
            const leaving_user = await getUserById(objectUserId, mongo)
            // TU EMITUJEMY CAŁY OBIEKT UŻYTKOWNIKA. MA TO NA CELU UMOŻLIWIENIE POINFORMOWANIA INNYCH UŻYTKOWNIKÓW OTYM KTO OPUŚCIŁ GRUPĘ I WYŚWIETLENIE KOMUNIKATU W UI
            io.to(groupId).emit("GROUP_USER_LEAVE", leaving_user)
            await socket.leave(groupId)            

    }
            
    
    // OBSŁUGA STATUSÓW UŻYTKOWNIKÓW - ONLINE I OFFLINE

    // GDY UŻYTKOWNIK LOGUJE SIĘ I JEST ONLINE WYSYŁA DO TEJ METODY SWÓJ OBIEKT.
    // Z TEGO OBIEKTU SPRAWDZAMY JACY UŻYTKOWNICY Z FRIENDLISTY LOGUJĄCEGO SIĘ USERA SĄ ONLINE I INFORMUJEMY ICH ŻE TEN USER JEST ONLINE
    static async USER_IS_ONLINE(online_user_id:string, user_friends:string[], socket:SOCKET, io:IO, mongo:MongoClient) {
        //POTRZEBNE : TABLICA PRZYJACIÓŁ USERA ONLINE, JEGO ID
        const collection = mongo.db("Artificium").collection("Users")
        const user_frineds_Objected = user_friends.map(friend => new ObjectId(friend))
        const friendsOnline = await collection.find({_id: {$in: user_frineds_Objected}, isOnline: true}, {projection:{_id:1}}).toArray()
        friendsOnline.forEach(friend => socket.broadcast.emit(`${friend._id}_USER_IS_ONLINE`, online_user_id))
    }

    // GDY UŻYTKOWNIK WYLOGOWUJE SIĘ Z APLIKACJI WYSYŁAMY DO TEJ METODY ID UŻYTKOWNIKA KTÓRY OPUSZCZA APLIKACJE
    // NASTĘPNIE SPRAWDZAMY JACY JEGO ZNAJOMI SĄ ONLINE I DO KAŻDEGO Z NICH WYSYŁAMY INFORMACJĘ ŻE UŻYTKOWNIK O WSKAZANYM ID OPUŚCIŁ APLIKACJĘ ( WYLOGOWAŁ SIĘ )
    static async USER_IS_OFFLINE(offline_user_id:string, user_friends:string[], socket:SOCKET, io:IO, mongo:MongoClient) {
        const collection = mongo.db("Artificium").collection("Users")
        const objected_user_friends = user_friends.map((friend_id:string) => new ObjectId(friend_id))
        const online_user_friends = await collection.find({_id: {$in:objected_user_friends}}, {projection:{_id:1}}).toArray()
        online_user_friends.forEach(friend => socket.broadcast.emit(`${friend._id.toString()}_USER_IS_OFFLINE`, offline_user_id))
    }
}
