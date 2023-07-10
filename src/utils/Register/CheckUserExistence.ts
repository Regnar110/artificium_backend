import { Collection } from "mongodb"
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator"

export const checkUserExistence = async (email:string, nickname:string, collection:Collection<Document>) => {
    try {
        const isUserExist = await collection.countDocuments({
            email:email
        }, {limit:1})
        console.log(isUserExist)
        if(isUserExist === 0) {
           return false
        } else {
            return true
        }          
        
    } catch (error) {
        const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "UserExistenceValidation Decorator: Decorator function error - user probably already exist in database", "User with this email already exist")
        return errorObject    
    }
}