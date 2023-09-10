//USER Register Handler
import { Db, ObjectId} from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"
import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator"
import { LoginValidation } from "../utils/Decorators/LoginValidation"
import dotenv from 'dotenv';
import { ProviderLoginValidation } from "../utils/Decorators/ProviderLoginValidation";
import STATE_STORE from "../state/state_store";
export class UserAccessController {

    @RegisterValidation
    static async  register(req:any, res:any, artificium_db:Db) {
        try {
            if(!req.body.status) {
                const artificium_users = artificium_db.collection("Users")
                const result = await artificium_users.insertOne(req.body)
                const succesObject = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Registration successful!", result)
                res.status(200).json(succesObject)                 
            } else {
                res.status(500).json(req.body)
            }
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "UserAccesController: register method error", "Register Error")
            res.status(510).json(errorObject)
        }
    }

    @LoginValidation
    static async login(req:any, res:any, _artificium_db:Db) {
        try {
            if(!req.body.status) {
                const succesObject = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Login Succcesful!", req.body)
                res.status(200).json(succesObject)                
            } else {
                res.status(500).json(req.body)
            }

        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "UserAccessController: login method error", "Login Error")
            res.status(510).json(errorObject)
        }
    }
    @ProviderLoginValidation
    static async googleIdentityLogin(req:any,res:any, artificium_db:Db) {
        console.log("googleidentitylogin")
        try {
            if(!req.body.status) {
                if(req.body._id) {

                    // Dokument użytkownika znaleziony po emailu , provider zgodny

                    const succesObject = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Login Succcesful!", req.body)
                    res.status(200).json(succesObject)
                } else {

                    // dokument użytkownika nie znaleziony po emailu. Rejestrujemy i zwracamy OBIEKT UŻYTKOWNIKA!!!! Nie zwracmamy samej wiadomosci o powodzeniui rejestracji.
                    // Tuta uzytkownik od razu jest zalogowany po rejestracji danych w bazie

                    const artificium_users = artificium_db.collection("Users")
                    await artificium_users.insertOne(req.body)
                    const succesObject = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Registration successful!", req.body)
                    res.status(200).json(succesObject)                         
                }
            } else {

                // Błędy, jeżeli użytkownik już istnieje lub jeżeli istnieje i provider jest niezgodny

                res.status(510).json(req.body)
            }
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "UserAccesController: googleIdentityLogin method error", "googleIdentityLogin Error")
            res.status(500).json(errorObject)
        }
        
    }

    static async userLogout(req:any, res:any, artificium_db:Db) {
        // zmieniamy status pola isOnline dokumentu uzytkownika na false - czym dajemy znać że użytkownik jest offline
        try {
            const { authUser } = req.body
            console.log("Logged out user id:" + authUser)
            const artificium_users = artificium_db.collection("Users")
            const logoutResult = await artificium_users.updateOne({
                _id:new ObjectId(authUser)
            }, {
                $set: {
                    isOnline:false
                }
            })
            console.log(logoutResult)
            if(logoutResult.modifiedCount === 1) {
                const succesObject = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Logout Succcesful!", logoutResult)
                res.status(200).json(succesObject)
            } else {
                const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "UserAccesController:  userLogout updateOne method error", "modifiedCount is not 1. User status not changed") 
                res.status(510).json(errorObject)
            }            
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserAccesController:  userLogout route error", "userLogout route overall error") 
            res.status(500).json(errorObject)
        }
    }
}
