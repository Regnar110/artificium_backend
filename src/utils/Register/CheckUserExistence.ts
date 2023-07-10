import { Collection } from "mongodb"
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator"

export const checkUserExistence = async (email:string, nickname:string, collection:Collection<Document>) => {
    try {
        const isEmailExist = await collection.countDocuments({
            email:email
        }, {limit:1})
        const isNicknameExist = await collection.countDocuments({
            nickname:nickname
        }, {limit:1})

        if(isEmailExist === 1 && isNicknameExist === 1) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "User with this nickname and email already exist.")
            return errorObject         
        } else if(isEmailExist === 0 && isNicknameExist === 0) {
           return false
        } else if(isEmailExist === 1) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "User with this email adress already exist.")
            return errorObject
        } else if(isNicknameExist === 1) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "User with this nickname already exist.")
            return errorObject
        }
    } catch (error) {
        const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserExistenceValidation Decorator: Decorator function error:CheckUserExistence Function", "Registration Error")
        return errorObject    
    }
}