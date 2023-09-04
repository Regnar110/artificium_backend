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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const UserAccessController_1 = require("./controllers/UserAccessController");
const ConnectMongo_1 = __importDefault(require("./utils/Mongo/ConnectMongo"));
const UserDashBoardActions_1 = require("./controllers/UserDashBoardActions");
class ArtificiumBackend {
    constructor() {
        dotenv_1.default.config();
        this.app = (0, express_1.default)();
        this.app.use((0, express_1.json)());
        this.app.use((0, cors_1.default)());
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: ["http://localhost:3000"],
                methods: ["GET", "POST"]
            },
            addTrailingSlash: false,
            transports: ['polling', 'websocket'],
        }); // Utwórz instancję serwera Socket.IO na bazie istniejącego serwera HTTP
        this.mongoClient = ConnectMongo_1.default.getInstance(); // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();
        this.setupSocketConnnection();
    }
    // private - można używać tylko z wnętrza trej klasy!!
    setupRoutes() {
        const client = this.mongoClient;
        const artificium_db = client.db("Artificium");
        // USER ACTIONS ROUTES
        this.app.post('/register', (req, res) => UserAccessController_1.UserAccessController.register(req, res, artificium_db));
        this.app.post('/login', (req, res) => UserAccessController_1.UserAccessController.login(req, res, artificium_db));
        this.app.post('/googleIdentityLogin', (req, res) => UserAccessController_1.UserAccessController.googleIdentityLogin(req, res, artificium_db));
        this.app.post('/userLogout', (req, res) => UserAccessController_1.UserAccessController.userLogout(req, res, artificium_db));
        // GROUPS ACTIONS ROUTES
        this.app.post('/createGroup', (req, res) => UserDashBoardActions_1.UserDashBoardActions.createGroup(req, res, artificium_db));
        this.app.post('/getUserGroups', (req, res) => UserDashBoardActions_1.UserDashBoardActions.getUserGroups(req, res, artificium_db));
    }
    setupSocketConnnection() {
        const client = this.mongoClient;
        const artificium_db = client.db("Artificium");
        // POWINNIŚMY WYEKSPORTOWAĆ CAŁĄ LOGIKĘ SOCKETA DO OSOBNEJ KLASY. OBSŁUGA SOCKETA POWINNA BAZOWAĆ NA ŻĄDANIACH HTTPS CELEM UMOŻLIWIENIA OBSŁUGI EWENTUALNYCH BŁĘDÓW
        // I ZWRACANIA UŻYTKOWNIKOWI ODPOWIEDZI Z SERWERA O STATUSACH JEGO ŻĄDAŃ.
        this.io.on('connect', (socket) => {
            console.log(`liczba połączonych użytkowników to: ${this.io.engine.clientsCount}`);
            console.log(`socket connection ID: ${socket.client.id}. Connected user id is: ${socket.handshake.query.userId}`); // ID KLIENTA !!!! SPÓJNE Z CLIENT-SIDE
            // jeżeli socket pomyslnie się połączy wysyłamy do klienta true, jeżeli nie to false
            socket.on("disconnect", (reason) => {
                console.log("user disconected");
                console.log(reason);
            });
            // DOŁĄCZANIE I OPUSZCZANIE GRUP
            //----------------------------------
            //UŻYTKOWNIK DOŁĄCZA DO POKOJU GRUPY
            socket.on("JOIN_GROUP_ROOM", (...args) => __awaiter(this, void 0, void 0, function* () {
                const [groupId, userId] = args;
                console.log(`UŻYTKOWNIK ${userId} DOŁĄCZYŁ DO POKOJU GRUPY: ${groupId}`);
                //CZekamy aż do grupy uda się dołączyć.
                // TUTAJ MUSIMY OGARNĄĆ LOGIKĘ ZWIĄZANĄ Z DODANIEM DO KONKRTNEGO DOKUENTU GRUPY ID UŻYTKOWNIKA W POLU ACTIVE USERS
                yield socket.join(groupId);
                // Emitujemy wiadomośc dla wszystkich uczestników grupy, że użytkownik o id userID dołączył do grupy.
                this.io.to(groupId).emit("GROUP_USER_JOIN", userId);
                this.user_group_room = args[0];
                // PO STronie klienta po wejściu w nową grupę, klient będzie emitował wiadomość dla servera że jest w tej grupie.
            }));
            // UZYTKOWNIK OPUSZCZA POKÓJ GRUPY
            socket.on("LEAVE_GROUP_ROOM", (...args) => __awaiter(this, void 0, void 0, function* () {
                const [groupId, userId] = args;
                this.io.to(groupId).emit("GROUP_USER_LEAVE", userId);
                yield socket.leave(groupId);
                console.log(`UŻYTKOWNIK ${userId} OPUSZCZA POKÓJ GRUPY: ${groupId}`);
            }));
            // LOGOWANIE I WYLOGOWYWANIE ZNAJOMYCH - BEZ PODZIAŁU NA GRUPY!
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const lookedFriends = yield UserDashBoardActions_1.UserDashBoardActions.getUserFriends(socket.handshake.query.userId, artificium_db);
                    socket.emit("chat", lookedFriends);
                    // if(typeof this.user_group === "string") {
                    //     console.log("GRUPA WYBRANA")
                    // }
                }
                catch (error) {
                }
            }), 10000);
        });
    }
}
const artificium = (new ArtificiumBackend()).server;
artificium.listen(3001, () => console.log("APP Running port 3001"));
//TO DO
// 1. Należy zaimplementować logikę dla endpoint /login.
// 2. UserExistenceCheck - ta funkcja musi być dostosowana do wykorzystania jej w /register jak i /login zgodnie z DRY
// 3. Po wprowadzeniu powyższego przełożyć wysyłane response na intefejs użytkownika - poinformowanie go o tym jak orzebiegł proces jego rejestracji lub logowania.
//HTTP STATUSES
// 200 REQUEST SUCCES
// 404 - data in db not found
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong
