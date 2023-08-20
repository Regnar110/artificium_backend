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
        this.io.on('connect', (socket) => { 
            
            // if(socket.client.request._query.connected_user_id === 'undefined') {
            //     // Jeżeli user _id będzie undefined zamykamy połaczenie.
            //     console.log("REQUIRED query parameter is undefined. Disconecting")
            //     socket.emit("connection_response", false) 
            // } else {
                console.log(this.io.engine.clientsCount)
                console.log("user connected " + socket.id)   
                // jeżeli socket pomyslnie się połączy wysyłamy do klienta true, jeżeli nie to false
            socket.on("disconnect", () => {
                console.log("user disconected")
            })
            setInterval(() => {
                socket.emit("chat", "Serwer wita się z klientem!")                
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