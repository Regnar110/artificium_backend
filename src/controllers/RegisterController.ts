//USER Register Handler

import { Db } from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"

import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator"

const UserExistenceValidation = (target: any, name: string, descriptor: PropertyDescriptor) => {
    console.log(target)
    console.log(name)
    console.log(descriptor)
    const originalMethod = descriptor.value;
    descriptor.value = async (...args: any[]) => {
        const artificium_db = args[2] as Db;
        const artificium_users = artificium_db.collection("Users")
        try {
            const isUserExist = await artificium_users.countDocuments({
                email:args[0].body.email
            }, {limit:1})
            console.log(isUserExist)
            if(isUserExist === 0) {
               return originalMethod.apply(target, args)
            } else {
                throw new Error
            }          
            
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserExistenceValidation Decorator: Decorator function error - user probably already exist in database", "User with this email already exist")
            args[0].body = errorObject
            return originalMethod.apply(target, args);    
        }
    }
}

export class RegisterController {

    @RegisterValidation
    static async  register(req:any, res:any, artificium_db:Db) {
        try {
            if(!req.body.status) {
                const artificium_users = artificium_db.collection("Users")
                const result = await artificium_users.insertOne(req.body)
                const x = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Registration successful!", result)
                res.json(x)                 
            } else {
                res.json(req.body)
            }
           
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "RegisterController: registration method error", "Registration Error")
            res.status(500).json(errorObject)
        }
    }

}
