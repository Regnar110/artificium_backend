import express, {json, Express} from "express"
import { Server } from "socket.io";
import http from 'http';
import cors from "cors"
import dotenv from 'dotenv'
import { UserAccessController } from "./controllers/UserAccessController";
import { MongoClient } from "mongodb";
import MongoDBClient from "./utils/Mongo/ConnectMongo";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { UserDashBoardActions } from "./controllers/UserDashBoardActions";

class ArtificiumBackend {
    readonly app:Express
    readonly io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    readonly server:http.Server
    readonly mongoClient: MongoClient
    
    //SOCKET

    private user_group_room: string | undefined
    
    constructor() {
        dotenv.config();
        this.app = express();
        this.app.use(json());
        this.app.use(cors());
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin:["http://localhost:3000"],
                methods:["GET", "POST"]
            },
            addTrailingSlash:false,
            transports: ['polling', 'websocket'],
          });; // Utwórz instancję serwera Socket.IO na bazie istniejącego serwera HTTP
        this.mongoClient = MongoDBClient.getInstance(); // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();
        this.setupSocketConnnection();
        
    }   
    
    // private - można używać tylko z wnętrza trej klasy!!
    private setupRoutes() {
        const client = this.mongoClient 
        const artificium_db = client.db("Artificium")
        // USER ACTIONS ROUTES
        this.app.post('/register', (req,res) => UserAccessController.register(req,res, artificium_db))
        this.app.post('/login', (req, res) => UserAccessController.login(req,res,artificium_db))
        this.app.post('/googleIdentityLogin', (req,res) => UserAccessController.googleIdentityLogin(req,res,artificium_db))
        this.app.post('/userLogout', (req,res) => UserAccessController.userLogout(req, res, artificium_db))

        // GROUPS ACTIONS ROUTES
        this.app.post('/createGroup', (req,res) => UserDashBoardActions.createGroup(req,res,artificium_db))
        this.app.post('/getUserGroups', (req,res) => UserDashBoardActions.getUserGroups(req,res, artificium_db))
    }

    private setupSocketConnnection() {// Chat będzie rozwijany w następnej kolejności. Na ten czas implementowana będzie logika odpowiedzialna za grupy i za wskazywanie użytkowników online.
        const client = this.mongoClient 
        const artificium_db = client.db("Artificium")
        this.io.on('connect', (socket) => { 
                console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`)
                console.log(`socket connection ID: ${socket.client.id}. Connected user id is: ${socket.handshake.query.userId as string}`) // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE
                // jeżeli socket pomyslnie się połączy wysyłamy do klienta true, jeżeli nie to false
            socket.on("disconnect", (reason) => {
                console.log("user disconected")
                console.log(reason)
                
            })

            //UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY
            socket.on("JOIN_GROUP_ROOM", async (...args) => {
                const [groupId, userId] = args
                console.log(`UŻYTKOWNIK ${userId} DOŁĄCZYŁ DO POKOJU GRUPY: ${groupId}`)
                await socket.join(args[0])
                this.io.to(args[0]).emit(args[0], `JESTEM W GRUPIE ID: ${args[0]} - ODPOWIEDŹ Z BACKENDU`);
                this.user_group_room = args[0] as string
                // PO STronie klienta po wejściu w nową grupę, klient będzie emitował wiadomość dla servera że jest w tej grupie.
            })

            // UZYTKOWNIK OPUSZCZA POKÓJ GRUPY
            socket.on("LEAVE_GROUP_ROOM", async (...args) => {
                const [groupId, userId] = args
                await socket.leave(groupId)
                console.log(`UŻYTKOWNIK ${userId} OPUSZCZA POKÓJ GRUPY: ${groupId}`)
            })
            
            setInterval(async () => { // EMITY Co 10 sekund do klienta
                try {
                    const lookedFriends = await UserDashBoardActions.getUserFriends(socket.handshake.query.userId as string, artificium_db)
                    socket.emit("chat", lookedFriends)
                    
                    // if(typeof this.user_group === "string") {
                    //     console.log("GRUPA WYBRANA")
                    // }
                } catch (error) {
                    
                }            
            },10000)

        })

    }
}

const artificium = (new ArtificiumBackend()).server;
artificium.listen(3001, () => console.log("APP Running port 3001"))

//TO DO
// 1. Należy zaimplementować logikę dla endpoint /login.
// 2. UserExistenceCheck - ta funkcja musi być dostosowana do wykorzystania jej w /register jak i /login zgodnie z DRY
// 3. Po wprowadzeniu powyższego przełożyć wysyłane response na intefejs użytkownika - poinformowanie go o tym jak orzebiegł proces jego rejestracji lub logowania.


//HTTP STATUSES

// 200 REQUEST SUCCES
// 404 - data in db not found
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong