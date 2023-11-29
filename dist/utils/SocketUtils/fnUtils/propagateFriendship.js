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
exports.propagateFriendship = void 0;
const mongodb_1 = require("mongodb");
const ConnectMongo_1 = require("../../Mongo/ConnectMongo");
const propagateFriendship = (_id1, _id2) => __awaiter(void 0, void 0, void 0, function* () {
    const resultOne = yield (0, ConnectMongo_1.db_collection)("Users").updateOne({ _id: new mongodb_1.ObjectId(_id1) }, { $push: { user_friends_ids: _id2 } });
    const resultTwo = yield (0, ConnectMongo_1.db_collection)("Users").updateOne({ _id: new mongodb_1.ObjectId(_id2) }, { $push: { user_friends_ids: _id1 } });
    let operationOneResult;
    let operationTwoResult;
    switch (resultOne.modifiedCount) {
        case 0:
            operationOneResult = false;
            if (resultTwo.modifiedCount = 0)
                break;
        default: break;
    }
    switch (resultTwo.modifiedCount) {
        case 0:
            if (resultOne.modifiedCount = 1) {
                // cofnięcie zmian w użytkowniku result 1
            }
            break;
        default: break;
    }
});
exports.propagateFriendship = propagateFriendship;
