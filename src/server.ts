import express, {json, Express} from "express"
import cors from "cors"
import dotenv from 'dotenv'
import { UserAccessController } from "./controllers/UserAccessController";
import { MongoClient } from "mongodb";
import MongoDBClient from "./utils/Mongo/ConnectMongo";

class ArtificiumBackend {
    readonly app:Express
    readonly mongoClient: MongoClient
    constructor() {
        dotenv.config()
        this.app = express()
        this.app.use(json())
        this.app.use(cors());
        this.mongoClient = MongoDBClient.getInstance() // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();
        
    }   
    
    // private - można używać tylko z wnętrza trej klasy!!
    private setupRoutes() {
        const client = this.mongoClient 
        const artificium_db = client.db("Artificium")
        this.app.post('/register', (req,res) => UserAccessController.register(req,res, artificium_db))
        this.app.post('/login', (req, res) => UserAccessController.login(req,res,artificium_db))
        this.app.post('/googleIdentityLogin', (req,res) => UserAccessController.googleIdentityLogin(req,res,artificium_db))
    }
}

const artificium = (new ArtificiumBackend()).app;
artificium.listen(3001, () => console.log("APP Running port 3001"))

//TO DO
// 1. Należy zaimplementować logikę dla endpoint /login.
// 2. UserExistenceCheck - ta funkcja musi być dostosowana do wykorzystania jej w /register jak i /login zgodnie z DRY
// 3. Po wprowadzeniu powyższego przełożyć wysyłane response na intefejs użytkownika - poinformowanie go o tym jak orzebiegł proces jego rejestracji lub logowania.


//HTTP STATUSES

// 200 REQUEST SUCCES
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong