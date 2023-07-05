import express, {json, Express} from "express"
import cors from "cors"
import dotenv from 'dotenv'
import { RegisterController } from "./controllers/RegisterController";
import { MongoClient } from "mongodb";
import MongoDBClient from "./utils/Mongo/ConnectMongo";


class ArtificiumBackend {
    readonly app:Express
    readonly mongoClient: MongoClient
    constructor() {
        this.app = express()
        this.app.use(json())
        this.app.use(cors());
        this.mongoClient = MongoDBClient.getInstance() // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();
        dotenv.config()
    }
    // private - można używać tylko z wnętrza trej klasy!!
    private async setupRoutes() {
        const client = this.mongoClient 
        const artificium_db = client.db("Artificium")
        this.app.post('/register', (req,res) => RegisterController.register(req,res, artificium_db))
    }
}

const artificium = (new ArtificiumBackend()).app;
artificium.listen(3001, () => console.log("APP Running port 3001"))