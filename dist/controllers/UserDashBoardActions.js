"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.UserDashBoardActions = void 0;
const mongodb_1 = require("mongodb");
const CreateGroupHandler_1 = require("../utils/Decorators/DashBoardActions/CreateGroupHandler");
const ResponseGenerator_1 = require("../utils/ResponseGenerator/ResponseGenerator");
class UserDashBoardActions {
    static createGroup(req, res, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
            // Po dotarciu do tej ścieżki uruchamiany jest proces tworzenia grupy wraz z wiązaniem użytkownika, który tworzy tą grupę do tej właśnie grupy.
            try {
                if (!req.body.status) {
                    const succesObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Group created successfuly!", req.body);
                    res.status(200).json(succesObject);
                }
                else {
                    res.status(req.body.status).json(req.body);
                }
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "CreateGroup Route: CreateGroup Route overall error", "CreateGroup route error");
                res.status(500).json(errorObject);
            }
        });
    }
    static getUserGroups(req, res, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
            // ścieżka zwracająca aktywne grupy danego użytkownika.
            try {
                const groups = yield artificium_db.collection("Groups").find({ group_users: { $in: [req.body.user_id] } }).toArray();
                res.status(200).json(groups);
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "GetUserGroups Route: GetUserGroups Route overall error", "GetUserGroups route error");
                res.status(500).json(errorObject);
            }
        });
    }
    static removeGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            // removeGroup - only for admin of the group. Group is deleted and connection to it is restricted
        });
    }
    static inviteToGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            // invite user to group. Each user can do this
        });
    }
    static getUserFriends(connectedUserId, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = artificium_db.collection("Users");
            const friendsToFind = yield users.findOne({ _id: new mongodb_1.ObjectId(connectedUserId) }, { projection: { user_friends_ids: 1, _id: 0 } });
            const objectedFriends = friendsToFind.user_friends_ids.map((id) => new mongodb_1.ObjectId(id));
            const foundDocs = yield users.find({ _id: { $in: objectedFriends } }, { projection: {
                    password: 0,
                    provider: 0,
                    user_friends_ids: 0,
                    user_groups_ids: 0
                } }).toArray();
            return foundDocs;
        });
    }
    static getUserGroupFriends(connectedUserId, groupId, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
__decorate([
    CreateGroupHandler_1.CreateGroupHandler
], UserDashBoardActions, "createGroup", null);
exports.UserDashBoardActions = UserDashBoardActions;
