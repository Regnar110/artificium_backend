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
exports.boundUserToGroup = void 0;
const mongodb_1 = require("mongodb");
const boundUserToGroup = (artificium_db, groupId, boundedUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const user_filter = { _id: new mongodb_1.ObjectId(boundedUserId) };
    const userUpdate = {
        $push: { user_groups_ids: groupId }
    };
    const group_filter = { _id: new mongodb_1.ObjectId(groupId) };
    const groupUpdate = { $push: { group_users: boundedUserId } };
    try {
        if (typeof groupId === 'undefined' || typeof boundedUserId === 'undefined') {
            throw new Error;
        }
        else {
            const groupsCollection = artificium_db.collection("Groups");
            const isUserAlreadyBoundedToGroup = yield groupsCollection.find({ _id: groupId, group_users: { $in: [boundedUserId] } }).toArray();
            if (isUserAlreadyBoundedToGroup.length > 0) {
                // użytkownik już jest połączony z tą grupą jako jej uczestnik
                return "ALREADY_BOUNDED";
            }
            else {
                const userUpdateResult = yield artificium_db.collection("Users").updateOne(user_filter, userUpdate);
                const groupUserArrUpdateResult = yield groupsCollection.updateOne(group_filter, groupUpdate);
                if (userUpdateResult.modifiedCount === 0 || groupUserArrUpdateResult.modifiedCount === 0) {
                    return "MODIFY_ERROR";
                }
                else {
                    return "SUCCESS";
                }
            }
        }
    }
    catch (error) {
        return "OVERALL_ERROR";
    }
});
exports.boundUserToGroup = boundUserToGroup;
