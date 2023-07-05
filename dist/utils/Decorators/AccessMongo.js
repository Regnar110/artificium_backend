"use strict";
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
exports.AccessMongo = void 0;
const ConnectMongo_1 = __importDefault(require("../Mongo/ConnectMongo"));
const ResponseGenerator_1 = require("../ResponseGenerator/ResponseGenerator");
const AccessMongo = (db_name, collection_name) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const mongoClient = yield ConnectMongo_1.default;
                const users_col = mongoClient.db(db_name).collection(collection_name);
                target[propertyKey].client = mongoClient;
                target[propertyKey].artificium_users = users_col;
                return originalMethod.apply(target, args);
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "AccesMongo Decorator: Probably MongoClient initialization error!", "Oops... Something went wrong. Contact us to solve this problem.");
                args[0].body = errorObject;
                return originalMethod.apply(target, args);
            }
        });
    };
};
exports.AccessMongo = AccessMongo;
//ACCES MONGO its a decorator which have onlye one function. Attached to method in class it allow to acces selected MONGO Daatabase and selected Collection in this Database.
//This decorator returns a mongoClient and artificium collection as a additional properties for a method whic we can handle with this.method.additionalProperty.
// Wyłaczone z użytku ze względu na możliwość tworzenia wielu instancji klienta mongoDB co nie jest zalecane zgodnie z dokumentacją.
// zmiast tego stworzono klasę w connectMongo.ts, która na bazie wzroca singletona zajmuje się tylko inicjalizacją kilenta mongo i uniemożliwia jego ponowne utworzenie.
