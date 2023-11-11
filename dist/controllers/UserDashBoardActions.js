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
exports.getUserMails = exports.getUserFriends = exports.getSelectedFriends = exports.getSelectedGroups = exports.getUserGroups = exports.createGroup = exports.UserDashBoardActions = void 0;
const mongodb_1 = require("mongodb");
const CreateGroupHandler_1 = require("../utils/Decorators/DashBoardActions/CreateGroupHandler");
const ResponseGenerator_1 = require("../utils/ResponseGenerator/ResponseGenerator");
const ConnectMongo_1 = require("../utils/Mongo/ConnectMongo");
class UserDashBoardActions {
    static createGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
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
    static getUserGroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // ścieżka zwracająca aktywne grupy danego użytkownika.
            try {
                const groups = yield (0, ConnectMongo_1.db_collection)("Groups").find({ group_users: { $in: [req.body.user_id] } }).toArray();
                res.status(200).json(groups);
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "GetUserGroups Route: GetUserGroups Route overall error", "GetUserGroups route error");
                res.status(500).json(errorObject);
            }
        });
    }
    static getSelectedGroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectedIds = req.body.map((el) => new mongodb_1.ObjectId(el));
            try {
                const groups = yield (0, ConnectMongo_1.db_collection)("Groups").find({ _id: { $in: objectedIds } }).toArray();
                res.status(200).json(groups);
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "GetSelectedGroups Route: GetSelectedGroups Route overall error", "GetSelectedGroups route error");
                res.status(500).json(errorObject);
            }
        });
    }
    static getSelectedFriends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectedIds = req.body.map((el) => new mongodb_1.ObjectId(el));
            try {
                const users = yield (0, ConnectMongo_1.db_collection)("Users").find({ _id: { $in: objectedIds } }).toArray();
                res.status(200).json(users);
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "GetSelectedFriends Route: GetSelectedFriends Route overall error", "GetSelectedFriends route error");
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
    static getUserFriends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("GET USER FRIENDS");
            const { user_id } = req.body;
            const friendsToFind = yield (0, ConnectMongo_1.db_collection)("Users").findOne({ _id: new mongodb_1.ObjectId(user_id) }, { projection: { user_friends_ids: 1, _id: 0 } });
            const objectedFriends = friendsToFind.user_friends_ids.map((id) => new mongodb_1.ObjectId(id));
            const foundDocs = yield (0, ConnectMongo_1.db_collection)("Users").find({ _id: { $in: objectedFriends } }, { projection: {
                    password: 0,
                    provider: 0,
                } }).toArray();
            res.json(foundDocs);
        });
    }
    static getUserGroupFriends(connectedUserId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static getUserMails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, newMailsOffset, endOffset } = req.body;
            console.log("GET USER MAIL HIT");
            const foundMails = (yield (0, ConnectMongo_1.db_collection)("Mailboxes").find({ ownerId: userId }).project({ mails: 1, _id: 0 }).toArray());
            // zwracamy 10 maili w zależności od numeru strony mailboxa na której znajduje się user po stronie klienta
            const processedMails = foundMails[0].mails.slice(newMailsOffset, endOffset);
            console.log(processedMails);
            console.log(processedMails.length);
            res.status(200).json(foundMails[0].mails);
        });
    }
}
__decorate([
    CreateGroupHandler_1.CreateGroupHandler
], UserDashBoardActions, "createGroup", null);
exports.UserDashBoardActions = UserDashBoardActions;
exports.createGroup = UserDashBoardActions.createGroup, exports.getUserGroups = UserDashBoardActions.getUserGroups, exports.getSelectedGroups = UserDashBoardActions.getSelectedGroups, exports.getSelectedFriends = UserDashBoardActions.getSelectedFriends, exports.getUserFriends = UserDashBoardActions.getUserFriends, exports.getUserMails = UserDashBoardActions.getUserMails;
