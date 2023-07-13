"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const UserAccessController_1 = require("./controllers/UserAccessController");
const ConnectMongo_1 = __importDefault(require("./utils/Mongo/ConnectMongo"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
class ArtificiumBackend {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use((0, express_1.json)());
        this.app.use(passport_1.default.initialize());
        this.app.use(passport_1.default.session());
        this.app.use((0, express_session_1.default)({
            resave: false,
            saveUninitialized: true,
            secret: "SECRET"
        }));
        this.app.use((0, cors_1.default)());
        this.mongoClient = ConnectMongo_1.default.getInstance(); // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();
        dotenv_1.default.config();
    }
    // private - można używać tylko z wnętrza trej klasy!!
    setupRoutes() {
        const client = this.mongoClient;
        const artificium_db = client.db("Artificium");
        this.app.post('/register', (req, res) => UserAccessController_1.UserAccessController.register(req, res, artificium_db));
        this.app.post('/login', (req, res) => UserAccessController_1.UserAccessController.login(req, res, artificium_db));
    }
}
const artificium = (new ArtificiumBackend()).app;
artificium.listen(3001, () => console.log("APP Running port 3001"));
//TO DO
// 1. Należy zaimplementować logikę dla endpoint /login.
// 2. UserExistenceCheck - ta funkcja musi być dostosowana do wykorzystania jej w /register jak i /login zgodnie z DRY
// 3. Po wprowadzeniu powyższego przełożyć wysyłane response na intefejs użytkownika - poinformowanie go o tym jak orzebiegł proces jego rejestracji lub logowania.
//HTTP STATUSES
// 200 REQUEST SUCCES
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong
