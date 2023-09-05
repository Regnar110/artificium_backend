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
exports.groupActiveUsersModify = void 0;
const mongodb_1 = require("mongodb");
const ResponseGenerator_1 = require("../../ResponseGenerator/ResponseGenerator");
const groupActiveUsersModify = (actionType, userId, groupId, mongo) => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongo.db("Artificium");
    const groups_col = db.collection("Groups");
    const docSearchFilter = { _id: new mongodb_1.ObjectId(groupId) };
    let updateResult;
    let responseObject;
    switch (actionType) {
        case "ADD_USER":
            updateResult = yield groups_col.updateOne(docSearchFilter, { $push: { active_users: userId } });
            break;
        case "REMOVE_USER":
            updateResult = yield groups_col.updateOne(docSearchFilter, { $pull: { active_users: userId } });
            break;
        default:
            break;
    }
    if (updateResult && updateResult.modifiedCount === 1) {
        responseObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Performed group activity action with success", {});
    }
    else {
        responseObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "groupActiveUserModify Utility Function:", "Failed to perform action on group JOIN / LEAVE. Contact us to solve the problem.");
    }
    return responseObject;
});
exports.groupActiveUsersModify = groupActiveUsersModify;
