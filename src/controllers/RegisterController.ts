//USER Register Handler

import { Db } from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"

import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator"
export class RegisterController {
    @RegisterValidation 
    static async  register(req:any, res:any, artificium_db:Db) {
        try {
            const artificium_users = artificium_db.collection("Users")
            const result = await artificium_users.insertOne(req.body)
            const x = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Registration successful!", result)
            res.json(x)            
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "RegisterController: registration method error", "Registration Error")
            res.status(500).json(errorObject)
        }
    }

}
