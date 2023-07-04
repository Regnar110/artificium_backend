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
const SecurePass_1 = require("../Register/SecurePass");
const RegisterValidation = (target, name, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        const { nickname, register_password, mail } = args[0].body;
        const securedPass = yield (0, SecurePass_1.SecurePass)(register_password);
        //   const mongoClient = await clientPromise
        //   const users_col = mongoClient.db("Artificium").collection("Users")
        const userObject = {
            email: mail,
            nickname,
            password: securedPass,
            avatar_id: "123",
            user_friends_ids: [],
            user_groups_ids: [],
        };
        args[0].body = userObject;
        //   target[name].client =  mongoClient;
        //   target[name].artificium_users = users_col
        // Wywołaj oryginalną metodę register. Target to klasa, w której znajduje się metoda a args to nowe parametry zmodyfikowane w drodze działania dekoratora.
        return originalMethod.apply(target, args);
    });
};
exports.RegisterValidation = RegisterValidation;
