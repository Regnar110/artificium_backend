//USER Register Handler
import { Collection, Db, WithId } from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"
import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator"
import { comparePass } from "../utils/Login/comparePass"
import { UserMongoDocument } from "../globalTypings/userMongoDocument"

const LoginValidation = (target:any, name:string, descriptor:PropertyDescriptor) => {
    console.log(target)
    console.log(name)
    console.log(descriptor)

    const originalMethod = descriptor.value

    descriptor.value = async (...args:any[]) => {
        try {
            const artificium_db = args[2] as Db;
            const artificium_users = artificium_db.collection("Users")
            const {email, login_password} = args[0].body
            const userDocument = await artificium_users.findOne({email:email}) as WithId<UserMongoDocument>
            delete userDocument.password
            if(typeof userDocument != 'undefined') {
                const isPasswordMatch = await comparePass(login_password, userDocument.password!)
                console.log('jest')
                if(isPasswordMatch === true) {
                    args[0].body = userDocument
                    return originalMethod.apply(target, args)
                } else {
                    const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "LoginValidation Decorator: Decorator function error", "Wrong email or password")
                    args[0].body = errorObject
                    return originalMethod.apply(target, args)
                }                   
            } else if(!userDocument) {
                console.log('nie ma')
                const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "LoginValidation Decorator: Decorator function error", "Wrong email or password" )
                args[0].body = errorObject
                return originalMethod.apply(target, args)
            }
    
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "LoginValidation Decorator: Decorator function error", "Login Error")
            args[0].body = errorObject
            return originalMethod.apply(target, args)
        }

    }
}

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
}
