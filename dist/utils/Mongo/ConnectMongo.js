"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db_collection = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.ATLAS_URI;
if (!uri) {
    throw new Error('Add Mongo URI to .env.local');
}
class MongoDBClient {
    constructor() {
        // Prywatny konstruktor, aby uniemożliwić tworzenie innych instancji
    }
    static getInstance() {
        if (!MongoDBClient.instance) {
            MongoDBClient.instance = new mongodb_1.MongoClient(uri);
            MongoDBClient.instance.connect();
        }
        return MongoDBClient.instance;
    }
    static db_collection(collection_name) {
        return MongoDBClient.instance && MongoDBClient.instance.db("Artificium").collection(collection_name);
    }
}
exports.default = MongoDBClient;
exports.db_collection = MongoDBClient.db_collection;
