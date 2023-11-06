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
exports.createNewUserMailbox = void 0;
const ConnectMongo_1 = require("../Mongo/ConnectMongo");
const createNewUserMailbox = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    const newMailboxObject = {
        ownerId,
        mails: []
    };
    const insertResult = yield (0, ConnectMongo_1.db_collection)("Mailboxes").insertOne(newMailboxObject);
    if (insertResult.acknowledged) {
        return insertResult.insertedId.toString();
    }
    else
        return false;
});
exports.createNewUserMailbox = createNewUserMailbox;
