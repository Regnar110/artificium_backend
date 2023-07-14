//USER Register Handler
import { Db} from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"
import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator"
import { LoginValidation } from "../utils/Decorators/LoginValidation"
import dotenv from 'dotenv';
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
    static async login(req:any, res:any, artificium_db:Db) {
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

    static async googleIdentityLogin(req:any,res:any, artificium_db:Db) {
      console.log(req.body)
    }
}
