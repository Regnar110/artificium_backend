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
const mongodb_1 = require("mongodb");
const RegisterValidation_1 = require("../utils/Decorators/RegisterValidation");
const ResponseGenerator_1 = require("../utils/ResponseGenerator/ResponseGenerator");
const LoginValidation_1 = require("../utils/Decorators/LoginValidation");
const ProviderLoginValidation_1 = require("../utils/Decorators/ProviderLoginValidation");
const ConnectMongo_1 = require("../utils/Mongo/ConnectMongo");
class UserAccessController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.status) {
                    const result = yield (0, ConnectMongo_1.db_collection)("Users").insertOne(req.body);
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
    static login(req, res) {
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
    static googleIdentityLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.status) {
                    if (req.body._id) {
                        // Dokument użytkownika znaleziony po emailu , provider zgodny
                        const succesObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Login Succcesful!", req.body);
                        res.status(200).json(succesObject);
                    }
                    else {
                        // dokument użytkownika nie znaleziony po emailu. Rejestrujemy i zwracamy OBIEKT UŻYTKOWNIKA!!!! Nie zwracmamy samej wiadomosci o powodzeniui rejestracji.
                        // Tuta uzytkownik od razu jest zalogowany po rejestracji danych w bazie
                        yield (0, ConnectMongo_1.db_collection)("Users").insertOne(req.body);
                        const succesObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Registration successful!", req.body);
                        res.status(200).json(succesObject);
                    }
                }
                else {
                    // Błędy, jeżeli użytkownik już istnieje lub jeżeli istnieje i provider jest niezgodny
                    res.status(510).json(req.body);
                }
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "UserAccesController: googleIdentityLogin method error", "googleIdentityLogin Error");
                res.status(500).json(errorObject);
            }
        });
    }
    static userLogout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("LOGOUT HUIT");
            // zmieniamy status pola isOnline dokumentu uzytkownika na false - czym dajemy znać że użytkownik jest offline
            try {
                (0, ConnectMongo_1.db_collection)("Users");
                // ZE WZGLĘDU NA TO ŻE DO TEGO ENDPOINTU MOŻE DOTRZEĆ RÓWNIEŻ ŻĄDANIE WYKONANE PRZY UŻYCIU navigator.sendBeacon() WYKONANE W MOMENCIE ZAMKNIĘCIA ZAKŁDKI LUB OKNA PRZEKLĄDARKI KLIENTA
                // SPRAWDZAMY CZY REQ.BODY JEST STRINGIEM. JEŻELI TAK TO ZNACZY ŻE REQUEST NADSZEDŁ Z BEACON API, W INNYM PRZYPADKU REQ.BODY BĘDZIE {authUser:string} WYSŁANY Z FETCH API
                let authUser = typeof req.body === "string" ? req.body : req.body.authUser;
                const logoutResult = yield (0, ConnectMongo_1.db_collection)("Users").updateOne({
                    _id: new mongodb_1.ObjectId(authUser)
                }, {
                    $set: {
                        isOnline: false
                    }
                });
                if (logoutResult.modifiedCount === 1) {
                    const succesObject = (0, ResponseGenerator_1.ResponseGenerator)("SUCCESS")(200, "Logout Succcesful!", logoutResult);
                    res.status(200).json(succesObject);
                }
                else {
                    const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "UserAccesController:  userLogout updateOne method error", "modifiedCount is not 1. User status not changed");
                    res.status(510).json(errorObject);
                }
            }
            catch (error) {
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "UserAccesController:  userLogout route error", "userLogout route overall error");
                res.status(500).json(errorObject);
            }
        });
    }
}
__decorate([
    RegisterValidation_1.RegisterValidation
], UserAccessController, "register", null);
__decorate([
    LoginValidation_1.LoginValidation
], UserAccessController, "login", null);
__decorate([
    ProviderLoginValidation_1.ProviderLoginValidation
], UserAccessController, "googleIdentityLogin", null);
exports.UserAccessController = UserAccessController;
