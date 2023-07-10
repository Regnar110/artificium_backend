"use strict";
//USER Register Handler
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
exports.RegisterController = void 0;
const RegisterValidation_1 = require("../utils/Decorators/RegisterValidation");
const ResponseGenerator_1 = require("../utils/ResponseGenerator/ResponseGenerator");
const UserExistenceValidation = (target, name, descriptor) => {
    console.log(target);
    console.log(name);
    console.log(descriptor);
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        const artificium_db = args[2];
        const artificium_users = artificium_db.collection("Users");
        try {
            const isUserExist = yield artificium_users.countDocuments({
                email: args[0].body.email
            }, { limit: 1 });
            console.log(isUserExist);
            if (isUserExist === 0) {
                return originalMethod.apply(target, args);
            }
            else {
                throw new Error;
            }
        }
        catch (error) {
            const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "UserExistenceValidation Decorator: Decorator function error - user probably already exist in database", "User with this email already exist");
            args[0].body = errorObject;
            return originalMethod.apply(target, args);
        }
    });
};
class RegisterController {
    static register(req, res, artificium_db) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.status) {
                    const artificium_users = artificium_db.collection("Users");
                    const result = yield artificium_users.insertOne(req.body);
                    const x = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Registration successful!", result);
                    res.json(x);
                }
                else {
                    res.json(req.body);
                }
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "RegisterController: registration method error", "Registration Error");
                res.status(500).json(errorObject);
            }
        });
    }
}
__decorate([
    RegisterValidation_1.RegisterValidation
], RegisterController, "register", null);
exports.RegisterController = RegisterController;
