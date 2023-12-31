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
exports.checkUserExistence = void 0;
const ResponseGenerator_1 = require("../ResponseGenerator/ResponseGenerator");
const ConnectMongo_1 = require("../Mongo/ConnectMongo");
const checkUserExistence = (email, nickname) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isEmailExist = yield (0, ConnectMongo_1.db_collection)("Users").countDocuments({
            email: email
        }, { limit: 1 });
        const isNicknameExist = yield (0, ConnectMongo_1.db_collection)("Users").countDocuments({
            nickname: nickname
        }, { limit: 1 });
        if (isEmailExist === 1 && isNicknameExist === 1) {
            const errorObject = (0, ResponseGenerator_1.ERROR_response)(510, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "User with this nickname and email already exist.");
            return errorObject;
        }
        else if (isEmailExist === 0 && isNicknameExist === 0) {
            return false;
        }
        else if (isEmailExist === 1) {
            const errorObject = (0, ResponseGenerator_1.ERROR_response)(510, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "User with this email adress already exist.");
            return errorObject;
        }
        else if (isNicknameExist === 1) {
            const errorObject = (0, ResponseGenerator_1.ERROR_response)(510, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "User with this nickname already exist.");
            return errorObject;
        }
    }
    catch (error) {
        const errorObject = (0, ResponseGenerator_1.ERROR_response)(500, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "Registration Error");
        return errorObject;
    }
});
exports.checkUserExistence = checkUserExistence;
