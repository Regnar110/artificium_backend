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
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const UserAccessController_1 = require("./controllers/UserAccessController");
const ConnectMongo_1 = __importDefault(require("./utils/Mongo/ConnectMongo"));
const UserDashBoardActions_1 = require("./controllers/UserDashBoardActions");
const Socket_1 = require("./controllers/Socket");
class ArtificiumBackend {
    constructor() {
        dotenv_1.default.config();
        this.app = (0, express_1.default)();
        this.app.use((0, express_1.json)());
        this.app.use((0, express_1.text)());
        this.app.use((0, cors_1.default)());
        this.server = http_1.default.createServer(this.app);
        ConnectMongo_1.default.getInstance(); // inicjalizacja instancji klienta mongoDB bez możliwości stworzenia kolejnych
        this.setupRoutes();
        // INSTANCJA SOCKET.IO
        new Socket_1.SocketIO(this.server);
    }
    // private - można używać tylko z wnętrza trej klasy!!
    setupRoutes() {
        const post = this.app.post.bind(this.app);
        // USER ACTIONS ROUTES
        post('/register', UserAccessController_1.register);
        post('/login', UserAccessController_1.login);
        post('/googleIdentityLogin', UserAccessController_1.googleIdentityLogin);
        post('/userLogout', UserAccessController_1.userLogout);
        // DASHBOARD ACTIONS
        // GROUPS ACTIONS ROUTES
        post('/createGroup', UserDashBoardActions_1.createGroup);
        post('/getUserGroups', UserDashBoardActions_1.getUserGroups);
        post('/getSelectedGroups', UserDashBoardActions_1.getSelectedGroups);
        post('/getSelectedUsers', UserDashBoardActions_1.getSelectedFriends);
        //FRIEND ACTION ROUTES
        post('/getUserFriends', UserDashBoardActions_1.getUserFriends);
    }
}
const artificium = (new ArtificiumBackend()).server;
artificium.listen(3001, () => console.log("APP Running port 3001"));
//HTTP STATUSES
// 200 REQUEST SUCCES
// 404 - data in db not found
// 500 Functionality Failed
// 510 BLOCK FAILED - Something bigger went wrong
