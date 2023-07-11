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
exports.UserAccessController = void 0;
const RegisterValidation_1 = require("../utils/Decorators/RegisterValidation");
const ResponseGenerator_1 = require("../utils/ResponseGenerator/ResponseGenerator");
const comparePass_1 = require("../utils/Login/comparePass");
const LoginValidation = (target, name, descriptor) => {
    console.log(target);
    console.log(name);
    console.log(descriptor);
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const artificium_db = args[2];
            const artificium_users = artificium_db.collection("Users");
            const { email, login_password } = args[0].body;
            const userDocument = yield artificium_users.findOne({ email: email });
            delete userDocument.password;
            if (typeof userDocument != 'undefined') {
                const isPasswordMatch = yield (0, comparePass_1.comparePass)(login_password, userDocument.password);
                console.log('jest');
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
                console.log('nie ma');
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
class UserAccessController {
    static register(req, res, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.status) {
                    const artificium_users = artificium_db.collection("Users");
                    const result = yield artificium_users.insertOne(req.body);
                    const succesObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Registration successful!", result);
                    res.status(200).json(succesObject);
                }
                else {
                    res.status(500).json(req.body);
                }
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "UserAccesController: register method error", "Register Error");
                res.status(510).json(errorObject);
            }
        });
    }
    static login(req, res, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.status) {
                    const succesObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Login Succcesful!", req.body);
                    res.status(200).json(succesObject);
                }
                else {
                    res.status(500).json(req.body);
                }
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "UserAccessController: login method error", "Login Error");
                res.status(510).json(errorObject);
            }
        });
    }
}
__decorate([
    RegisterValidation_1.RegisterValidation
], UserAccessController, "register", null);
__decorate([
    LoginValidation
], UserAccessController, "login", null);
exports.UserAccessController = UserAccessController;
