import { MongoClient, ObjectId } from "mongodb";
import { ERROR_response, SUCCESS_response } from "../../ResponseGenerator/ResponseGenerator";

export const groupActiveUsersModify = async (actionType:"ADD_USER" | "REMOVE_USER", userId:ObjectId, groupId:string, mongo:MongoClient):Promise<ErrorResponseType | SuccesResponseType> => {
    try {
        const db = mongo.db("Artificium")
        const groups_col = db.collection("Groups")
        const docSearchFilter = { _id: new ObjectId(groupId)}
        let updateResult;
        switch (actionType) {
            case "ADD_USER":
                updateResult = await groups_col.updateOne(docSearchFilter, {$push:{active_users:userId}})
                break;
            case "REMOVE_USER":
                updateResult = await groups_col.updateOne(docSearchFilter, {$pull:{active_users:userId}})
                break;
            default:
                break;
        }
        if(updateResult && updateResult.modifiedCount === 1) {
            const responseObject = SUCCESS_response(200, "Performed group activity action with success", {}) as SuccesResponseType
            return responseObject
        } else {
            const responseObject = ERROR_response(510, "groupActiveUserModify Utility Function:", "Failed to perform action on group JOIN / LEAVE. Contact us to solve the problem.") as ErrorResponseType
            return responseObject
        }      
    } catch (error) {
        const errorObject = ERROR_response(510, "groupActiveUserModify Utility Function:", "Failed to perform TRY block logic on groupActiveUsersModify Function") as ErrorResponseType
        return errorObject
    }

}