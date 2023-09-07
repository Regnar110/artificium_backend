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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const mongodb_1 = require("mongodb");
const getUserById = (userId, mongo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = mongo.db("Artificium");
        const collection = db.collection("Users");
        const findResult = yield collection.findOne({ _id: new mongodb_1.ObjectId(userId) }, { projection: { password: 0 } });
        console.log(findResult);
        return findResult;
    }
    catch (error) {
    }
});
exports.getUserById = getUserById;
