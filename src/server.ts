import express, {json, Express} from "express"
import cors from "cors"
import dotenv from 'dotenv'
import { RegisterController } from "./controllers/RegisterController";
const app = express()

class ArtificiumBackend {
    readonly app:Express
    constructor() {
        this.app = express()
        this.app.use(json())
        this.app.use(cors());
        this.setupRoutes();
        dotenv.config()
    }
    // private - można używać tylko z wnętrza trej klasy!!
    private setupRoutes() {
        this.app.post('/register', RegisterController.register)
            
    }
}

const artificium = (new ArtificiumBackend()).app;
artificium.listen(3001, () => console.log("APP Running port 3001"))

// app.use(json()) //BODY parsing from express
// app.use(cors()) // Allow "unsafe" connections

// app.get('/', (req, res) => {
//     res.json("<h1>JEstem</h1>")
// })

// //endpoints

// app.post('websocketConnection')// przykłądowa inicjalizacja websocketa

// app.post("/register", (req,res) => RegisterController.register(req,res))
// // app.post("/register", (req,res) => register(req, res))

// app.post('/login')


// app.listen(3001, () => console.log("APP Running port 3001s"))