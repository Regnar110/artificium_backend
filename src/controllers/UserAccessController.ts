import { Db, ObjectId} from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"
import { ERROR_response, SUCCESS_response } from "../utils/ResponseGenerator/ResponseGenerator"
import { LoginValidation } from "../utils/Decorators/LoginValidation"
import dotenv from 'dotenv';
import { ProviderLoginValidation } from "../utils/Decorators/ProviderLoginValidation";
import { db_collection } from "../utils/Mongo/ConnectMongo";
import { createNewUserMailbox } from "../utils/Register/createNewUserMailbox";
export class UserAccessController {

    @RegisterValidation
    static async  register(req:any, res:any) {
        try {
            if(!req.body.status) {
                
                const userRegisterResult = await db_collection("Users").insertOne(req.body)
                if(userRegisterResult.acknowledged) {
                    const mailboxCreateResult = await createNewUserMailbox(userRegisterResult.insertedId.toString())
                    if(mailboxCreateResult !==false ){
                        const addMailboxToUserDocument = await db_collection("Users").updateOne({_id: userRegisterResult.insertedId}, {$set: {mailboxId:mailboxCreateResult}})   
                    } else {
                        // obsługa błędu jeżeli nie uda się utworzyć mailboxa
                    } 

                } else {
                    // obsługa błędu jeżeli nie uda się utworzyć użytkownika.
                }
                const succesObject = SUCCESS_response(200, "Registration successful!", userRegisterResult)
                res.status(200).json(succesObject)                 
            } else {
                res.status(500).json(req.body)
            }
        } catch (error) {
            const errorObject = ERROR_response(510, "UserAccesController: register method error", "Register Error")
            res.status(510).json(errorObject)
        }
    }

    @LoginValidation
    static async login(req:any, res:any) {
        try {
            if(!req.body.status) {
                const succesObject = SUCCESS_response(200, "Login Succcesful!", req.body)
                res.status(200).json(succesObject)                
            } else {
                res.status(500).json(req.body)
            }

        } catch (error) {
            const errorObject = ERROR_response(510, "UserAccessController: login method error", "Login Error")
            res.status(510).json(errorObject)
        }
    }
    @ProviderLoginValidation
    static async googleIdentityLogin(req:any,res:any) { 
        try {
            
            if(!req.body.status) {
                if(req.body._id) {

                    // Dokument użytkownika znaleziony po emailu , provider zgodny

                    const succesObject = SUCCESS_response(200, "Login Succcesful!", req.body)
                    res.status(200).json(succesObject)
                } else {

                    // dokument użytkownika nie znaleziony po emailu. Rejestrujemy i zwracamy OBIEKT UŻYTKOWNIKA!!!! Nie zwracmamy samej wiadomosci o powodzeniui rejestracji.
                    // Tuta uzytkownik od razu jest zalogowany po rejestracji danych w bazie
                    await db_collection("Users").insertOne(req.body)
                    const succesObject = SUCCESS_response(200, "Registration successful!", req.body)
                    res.status(200).json(succesObject)                         
                }
            } else {

                // Błędy, jeżeli użytkownik już istnieje lub jeżeli istnieje i provider jest niezgodny

                res.status(510).json(req.body)
            }
        } catch (error) {
            const errorObject = ERROR_response(510, "UserAccesController: googleIdentityLogin method error", "googleIdentityLogin Error")
            res.status(500).json(errorObject)
        }
        
    }

    static async userLogout(req:any, res:any) {
        console.log("LOGOUT HUIT")
        // zmieniamy status pola isOnline dokumentu uzytkownika na false - czym dajemy znać że użytkownik jest offline
        try {
            db_collection("Users")
            // ZE WZGLĘDU NA TO ŻE DO TEGO ENDPOINTU MOŻE DOTRZEĆ RÓWNIEŻ ŻĄDANIE WYKONANE PRZY UŻYCIU navigator.sendBeacon() WYKONANE W MOMENCIE ZAMKNIĘCIA ZAKŁDKI LUB OKNA PRZEKLĄDARKI KLIENTA
            // SPRAWDZAMY CZY REQ.BODY JEST STRINGIEM. JEŻELI TAK TO ZNACZY ŻE REQUEST NADSZEDŁ Z BEACON API, W INNYM PRZYPADKU REQ.BODY BĘDZIE {authUser:string} WYSŁANY Z FETCH API
            let authUser:string = typeof req.body === "string" ? req.body : req.body.authUser
            const logoutResult = await db_collection("Users").updateOne({
                _id:new ObjectId(authUser)
            }, {
                $set: {
                    isOnline:false
                }
            })
            if(logoutResult.modifiedCount === 1) {
                const succesObject = SUCCESS_response(200, "Logout Succcesful!", logoutResult)
                res.status(200).json(succesObject)
            } else {
                const errorObject = ERROR_response(510, "UserAccesController:  userLogout updateOne method error", "modifiedCount is not 1. User status not changed") 
                res.status(510).json(errorObject)
            }            
        } catch (error) {
            const errorObject = ERROR_response(500, "UserAccesController:  userLogout route error", "userLogout route overall error") 
            res.status(500).json(errorObject)
        }
    }
}

export const {register, login, googleIdentityLogin, userLogout} = UserAccessController