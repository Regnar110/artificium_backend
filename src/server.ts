import express, {json, Express} from "express"
import { Server } from "socket.io";
import http from 'http';
import cors from "cors"
import dotenv from 'dotenv'
import { UserAccessController } from "./controllers/UserAccessController";
import { MongoClient } from "mongodb";
import MongoDBClient from "./utils/Mongo/ConnectMongo";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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
        this.app.post('/register', (req,res) => UserAccessController.register(req,res, artificium_db))
        this.app.post('/login', (req, res) => UserAccessController.login(req,res,artificium_db))
        this.app.post('/googleIdentityLogin', (req,res) => UserAccessController.googleIdentityLogin(req,res,artificium_db))
    }

    private setupSocketConnnection() {
        console.log("init")
        this.io.on('connection', (socket) => {
            console.log(socket)
            console.log('a user connected')
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