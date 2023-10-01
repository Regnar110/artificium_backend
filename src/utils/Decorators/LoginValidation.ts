import { Db, WithId } from "mongodb";
import { UserMongoDocument } from "../../globalTypings/userMongoDocument";
import { comparePass } from "../Login/comparePass";
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator";

export const LoginValidation = (target:any, name:string, descriptor:PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = async (...args:any[]) => {
        try {
            const artificium_db = args[2] as Db;
            const artificium_users = artificium_db.collection("Users")
            const {email, login_password} = args[0].body
            const userDocument = await artificium_users.findOne({email:email}) as WithId<UserMongoDocument>
            if(userDocument) {      
                const documentPassword = userDocument.password as string
                delete userDocument.password
                const isPasswordMatch = await comparePass(login_password, documentPassword)
                if(isPasswordMatch === true) {
                    // logowanie udane
                    const updateUserActivityStatus = await artificium_users.updateOne({
                        email:email
                    }, {
                        $set: {
                            isOnline: true
                        }
                    })
                    userDocument.isOnline = true
                    args[0].body = userDocument
                    return originalMethod.apply(target, args)
                } else {
                    const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "LoginValidation Decorator: Decorator function error", "Wrong email or password")
                    args[0].body = errorObject
                    return originalMethod.apply(target, args)
                }                   
            } else if(!userDocument) {
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
