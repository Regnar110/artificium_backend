import { Db, ObjectId } from "mongodb"
import { ResponseGenerator } from "../../ResponseGenerator/ResponseGenerator"
import { boundUserToGroup } from "../../GroupActionUtils/BoundUserToGroup"

export const CreateGroupHandler = (target:any, name:string, descriptor:PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async (...args:[any,any,Db]) => {
        const [ req, res, artificium_db ]  = args
        try {
            const groupsCollection = artificium_db.collection("Groups");
            const isGroupNameExist = await groupsCollection.countDocuments({
                group_name:req.body.group_name // Lowercase Comparsion - TO DO!
            }, {limit:1})
            if(isGroupNameExist === 1) {
                const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "CreateGroupHandler Decorator: Decorator function error", "Group with this name already exist.")
                args[0].body = errorObject
                return originalMethod.apply(target, args)
            } else { // if group with such name doesnt exist
                const newGroupTemplate = {
                    ...req.body,
                    group_users:[],
                    group_invite_slugId:""
                }
                const insertResult = await groupsCollection.insertOne(newGroupTemplate)
                console.log(insertResult)
                const boundResult = await boundUserToGroup(artificium_db, insertResult.insertedId as ObjectId, req.body.group_admin as string)
                // TUTAJ DODAĆ OBSŁUGĘ BŁĘDÓW dla BOUND RESULT
                args[0].body = {
                    ...insertResult,
                    bound:boundResult
                }
                return originalMethod.apply(target, args)
            }
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "CreateGroupHandler Decorator: Decorator function error", "CreateGroupHandler Error.")
            args[0].body = errorObject
            return originalMethod.apply(target, args)
        }

    }
}