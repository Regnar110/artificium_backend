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
exports.CreateGroupHandler = void 0;
const ResponseGenerator_1 = require("../../ResponseGenerator/ResponseGenerator");
const BoundUserToGroup_1 = require("../../GroupActionUtils/BoundUserToGroup");
const CreateGroupHandler = (target, name, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        const [req, res, artificium_db] = args;
        try {
            const groupsCollection = artificium_db.collection("Groups");
            const isGroupNameExist = yield groupsCollection.countDocuments({
                group_name: req.body.group_name // Lowercase Comparsion - TO DO!
            }, { limit: 1 });
            if (isGroupNameExist === 1) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "CreateGroupHandler Decorator: Decorator function error", "Group with this name already exist.");
                args[0].body = errorObject;
                return originalMethod.apply(target, args);
            }
            else { // if group with such name doesnt exist
                const newGroupTemplate = Object.assign(Object.assign({}, req.body), { group_users: [], group_invite_slugId: "" });
                const insertResult = yield groupsCollection.insertOne(newGroupTemplate);
                console.log(insertResult);
                const boundResult = yield (0, BoundUserToGroup_1.boundUserToGroup)(artificium_db, insertResult.insertedId, req.body.group_admin);
                // TUTAJ DODAĆ OBSŁUGĘ BŁĘDÓW dla BOUND RESULT
                args[0].body = Object.assign(Object.assign({}, insertResult), { bound: boundResult });
                return originalMethod.apply(target, args);
            }
        }
        catch (error) {
            const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "CreateGroupHandler Decorator: Decorator function error", "CreateGroupHandler Error.");
            args[0].body = errorObject;
            return originalMethod.apply(target, args);
        }
    });
};
exports.CreateGroupHandler = CreateGroupHandler;
