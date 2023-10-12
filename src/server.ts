import express, {json, Express, text} from "express"
import http from 'http';
import cors from "cors"
import dotenv from 'dotenv'
import { googleIdentityLogin, login, register, userLogout } from "./controllers/UserAccessController";
import MongoDBClient from "./utils/Mongo/ConnectMongo";
import { createGroup, getSelectedFriends, getSelectedGroups, getUserFriends, getUserGroups } from "./controllers/UserDashBoardActions";
import { SocketIO } from "./controllers/Socket";

class ArtificiumBackend {
    readonly app:Express
    readonly server:http.Server

    constructor() {
        dotenv.config();
        this.app = express();
        this.app.use(json());
        this.app.use(text())
        this.app.use(cors());
        this.server = http.createServer(this.app);
        MongoDBClient.getInstance(); // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();

        // INSTANCJA SOCKET.IO
        new SocketIO(this.server)
        
    }   
    
    // private - można używać tylko z wnętrza trej klasy!!
    private setupRoutes() {
        const post = this.app.post.bind(this.app)
        // USER ACTIONS ROUTES
        post('/register', register)
        post('/login', login)
        post('/googleIdentityLogin', googleIdentityLogin)
        post('/userLogout', userLogout)

        // DASHBOARD ACTIONS
        // GROUPS ACTIONS ROUTES
        post('/createGroup', createGroup)
        post('/getUserGroups', getUserGroups)
        post('/getSelectedGroups', getSelectedGroups)
        post('/getSelectedUsers', getSelectedFriends)
        
        //FRIEND ACTION ROUTES
        
        post('/getUserFriends', getUserFriends)
    }
}

const artificium = (new ArtificiumBackend()).server;
artificium.listen(3001, () => console.log("APP Running port 3001"))

//HTTP STATUSES

// 200 REQUEST SUCCES
// 404 - data in db not found
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong