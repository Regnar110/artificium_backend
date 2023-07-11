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
exports.LoginValidation = void 0;
const comparePass_1 = require("../Login/comparePass");
const ResponseGenerator_1 = require("../ResponseGenerator/ResponseGenerator");
const LoginValidation = (target, name, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const artificium_db = args[2];
            const artificium_users = artificium_db.collection("Users");
            const { email, login_password } = args[0].body;
            const userDocument = yield artificium_users.findOne({ email: email });
            if (userDocument) {
                const documentPassword = userDocument.password;
                delete userDocument.password;
                const isPasswordMatch = yield (0, comparePass_1.comparePass)(login_password, documentPassword);
                if (isPasswordMatch === true) {
                    args[0].body = userDocument;
                    return originalMethod.apply(target, args);
                }
                else {
                    const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "LoginValidation Decorator: Decorator function error", "Wrong email or password");
                    args[0].body = errorObject;
                    return originalMethod.apply(target, args);
                }
            }
            else if (!userDocument) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "LoginValidation Decorator: Decorator function error", "Wrong email or password");
                args[0].body = errorObject;
                return originalMethod.apply(target, args);
            }
        }
        catch (error) {
            const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "LoginValidation Decorator: Decorator function error", "Login Error");
            args[0].body = errorObject;
            return originalMethod.apply(target, args);
        }
    });
};
exports.LoginValidation = LoginValidation;
