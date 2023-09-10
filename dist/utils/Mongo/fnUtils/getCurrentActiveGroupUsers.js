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
exports.getCurrentActiveGroupUsers = void 0;
const mongodb_1 = require("mongodb");
const getCurrentActiveGroupUsers = (groupId, mongo) => __awaiter(void 0, void 0, void 0, function* () {
    const group_collection = mongo.db("Artificium").collection("Groups");
    const user_collection = mongo.db("Artificium").collection("Users");
    const [{ active_users }] = yield group_collection.find({ _id: new mongodb_1.ObjectId(groupId) }, { projection: { active_users: 1, _id: 0 } }).toArray();
    const active_users_objects = yield user_collection.find({ _id: { $in: active_users } }).toArray();
    return active_users_objects;
});
exports.getCurrentActiveGroupUsers = getCurrentActiveGroupUsers;
