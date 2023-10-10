"use strict";
// DOSTAJE req.body z emailem.
// Najpierw sprwdzamy czy email istnieje. jeżeli istnieje zwracamy z bazy danych obiekt użytkownika.
// Jeżeli nie istnieje wysyłamy do klienta odpowiednią odpowiedź mówiącą mu otym że użytkownik z tym mailem nie jest zarejestrowany.
// potem po stronie klienta aplikacja prosi o nickname.
// gdy użytkownik poda nickname dochodzi rejestracji użytkownika z mailem i nicknamem
// gdy ten proces się zakończy użytkownik jest AUTHENTICATED. 
// Jezeli użytkownik nie poda maila, nasapi natycmmiadtowe zakończenie sesji po stronie klienta
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
exports.ProviderLoginValidation = void 0;
const ResponseGenerator_1 = require("../ResponseGenerator/ResponseGenerator");
const ConnectMongo_1 = require("../Mongo/ConnectMongo");
const ProviderLoginValidation = (target, name, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, provider } = args[0].body;
            const userDocument = yield (0, ConnectMongo_1.db_collection)("Users").findOne({ email: email });
            if (userDocument) {
                if (userDocument.provider !== provider) {
                    // Email istnieje, ale provider jest inny
                    const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "ProviderLoginValidation Decorator: Decorator function error", "User with this email already exist! Provider is not correct");
                    args[0].body = errorObject;
                    return originalMethod.apply(target, args);
                }
                else {
                    // Użytkownik istnieje, provider zgodny. Logowanie kontynuowane
                    const updateUserActivityStatus = yield (0, ConnectMongo_1.db_collection)("Users").updateOne({
                        email: email
                    }, {
                        $set: {
                            isOnline: true
                        }
                    });
                    userDocument.isOnline = true;
                    args[0].body = userDocument;
                    return originalMethod.apply(target, args);
                }
            }
            else {
                //Email nie istnieje. Rejestracja użytkownika i jego zwrot
                //REQ.BODY STAJE SIE NOWYM OBIEKTEM UZYTKOWNIKA
                args[0].body = Object.assign(Object.assign({ isOnline: true, isInactive: false }, args[0].body), { avatar_id: "1", user_friends_ids: [], user_groups_ids: [] });
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
exports.ProviderLoginValidation = ProviderLoginValidation;
