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
exports.RegisterValidation = void 0;
// import clientPromise from "../Mongo/ConnectMongo";
const SecurePass_1 = require("../Register/SecurePass");
const ResponseGenerator_1 = require("../ResponseGenerator/ResponseGenerator");
const CheckUserExistence_1 = require("../Register/CheckUserExistence");
const RegisterValidation = (target, name, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const artificium_db = args[2];
            const artificium_users = artificium_db.collection("Users");
            const { nickname, register_password, email } = args[0].body;
            const securedPass = yield (0, SecurePass_1.SecurePass)(register_password);
            const userExist = yield (0, CheckUserExistence_1.checkUserExistence)(email, nickname, artificium_users);
            if (userExist === false) {
                const userObject = {
                    email,
                    nickname,
                    password: securedPass,
                    avatar_id: "123",
                    user_friends_ids: [],
                    user_groups_ids: [],
                };
                args[0].body = userObject;
                return originalMethod.apply(target, args);
            }
            else if (userExist === true) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "RegisterValidation Decorator: Decorator function error - user already exist", "User with selected email and nickname set already exist. Try another nickname or email.");
                args[0].body = errorObject;
                return originalMethod.apply(target, args);
            }
        }
        catch (error) {
            const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "RegisterValidation Decorator: Decorator function error", "Registration Error");
            args[0].body = errorObject;
            return originalMethod.apply(target, args);
        }
    });
};
exports.RegisterValidation = RegisterValidation;
//Dekorator odpowiadający za kompletowanie obiektu użytkownika celem insertowania go jako dokument MOngo. 
// Ma tu miejsce również hashowanie hasło z użyciem bcrypt.
