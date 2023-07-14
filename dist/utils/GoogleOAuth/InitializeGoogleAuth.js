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
exports.InitializeGoogleAuth = void 0;
const passport_google_oauth2_1 = require("passport-google-oauth2");
class InitializeGoogleAuth {
    static initializeGoogleSignInAuth(passport) {
        passport.use(new passport_google_oauth2_1.Strategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET_KEY,
            callbackURL: "http://localhost:3001/auth/google/callback"
        }, (accesToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
            }
        })));
    }
}
exports.InitializeGoogleAuth = InitializeGoogleAuth;
//https://www.makeuseof.com/nodejs-google-authentication/
