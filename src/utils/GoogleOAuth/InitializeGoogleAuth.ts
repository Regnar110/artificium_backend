import dotenv from 'dotenv';
import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, Strategy, VerifyCallback } from "passport-google-oauth2";
export class InitializeGoogleAuth {
    private static GoogleAuthInstance:GoogleStrategy;

    static initializeGoogleSignInAuth(passport:PassportStatic, ){ 
        passport.use(new Strategy({
            clientID:"",
            clientSecret:"",
            callbackURL:"http://localhost:3001/auth/google/callback"
        },
        async (accesToken:string, refreshToken:string, profile:any, done:VerifyCallback) => {
            try {
                
            } catch (error) {
                
            }
        }
        ))
    }
}


//https://www.makeuseof.com/nodejs-google-authentication/