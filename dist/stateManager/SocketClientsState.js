"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = exports.findClient = exports.removeClient = exports.addClient = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.ATLAS_URI;
if (!uri) {
    throw new Error('Add Mongo URI to .env.local');
}
class SocketClientState {
    constructor() { }
    static getState() {
        return SocketClientState.state;
    }
    static addClient(client) {
        SocketClientState.state = [...this.state, client];
        console.log(SocketClientState.state);
    }
    static removeClient(socketId) {
        const newState = SocketClientState.state.filter(client => client.socketId !== socketId);
        SocketClientState.state = newState;
        console.log(SocketClientState.state);
    }
    static findClient(clientId) {
        return SocketClientState.state.filter(client => client.userId === clientId)[0];
    }
}
SocketClientState.state = [];
exports.default = SocketClientState;
exports.addClient = SocketClientState.addClient, exports.removeClient = SocketClientState.removeClient, exports.findClient = SocketClientState.findClient, exports.getState = SocketClientState.getState;
