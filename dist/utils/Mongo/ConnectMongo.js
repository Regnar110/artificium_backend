"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.ATLAS_URI;
let client;
let clientPromise;
if (!uri) {
    throw new Error('Add Mongo URI to .env.local');
}
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new mongodb_1.MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}
else {
    client = new mongodb_1.MongoClient(uri);
    clientPromise = client.connect();
}
exports.default = clientPromise;
