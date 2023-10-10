import express, {json, Express, text} from "express"
import { Server } from "socket.io";
import http from 'http';
import cors from "cors"
import dotenv from 'dotenv'
import { UserAccessController } from "./controllers/UserAccessController";
import { MongoClient } from "mongodb";
import MongoDBClient from "./utils/Mongo/ConnectMongo";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { UserDashBoardActions } from "./controllers/UserDashBoardActions";
import { SocketIO } from "./controllers/Socket";
class ArtificiumBackend {
    readonly app:Express
    readonly io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    // readonly socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    readonly server:http.Server
    readonly mongoClient: MongoClient

    //SOCKET
    constructor() {
        dotenv.config();
        this.app = express();
        this.app.use(json());
        this.app.use(text())
        this.app.use(cors());
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin:["http://localhost:3000"],
                methods:["GET", "POST"]
            },
            addTrailingSlash:false,
            transports: ['polling', 'websocket'],
          }); // Utwórz instancję serwera Socket.IO na bazie istniejącego serwera HTTP
        this.mongoClient = MongoDBClient.getInstance(); // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();

        // INSTANCJA SOCKET.IO
        new SocketIO(this.io, this.mongoClient)
        
    }   
    
    // private - można używać tylko z wnętrza trej klasy!!
    private setupRoutes() {
        // USER ACTIONS ROUTES
        this.app.post('/register', (req,res) => UserAccessController.register(req,res))
        this.app.post('/login', (req, res) => UserAccessController.login(req,res))
        this.app.post('/googleIdentityLogin', (req,res) => UserAccessController.googleIdentityLogin(req,res))
        this.app.post('/userLogout', (req,res) => UserAccessController.userLogout(req, res))

        // GROUPS ACTIONS ROUTES
        this.app.post('/createGroup', (req,res) => UserDashBoardActions.createGroup(req,res))
        this.app.post('/getUserGroups', (req,res) => UserDashBoardActions.getUserGroups(req,res))
        this.app.post('/getSelectedGroups', (req,res) => UserDashBoardActions.getSelectedGroups(req,res))
        this.app.post('/getSelectedUsers', (req, res) => UserDashBoardActions.getSelectedFriends(req,res))
        
        //FRIEND ACTION ROUTES
        
        this.app.post('/getUserFriends', (req, res) => UserDashBoardActions.getUserFriends(req, res))
    }
}

const artificium = (new ArtificiumBackend()).server;
artificium.listen(3001, () => console.log("APP Running port 3001"))

//HTTP STATUSES

// 200 REQUEST SUCCES
// 404 - data in db not found
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong