import { Db, ObjectId } from "mongodb";

export const boundUserToGroup = async (artificium_db:Db, groupId:ObjectId, boundedUserId:string) => {
    const user_filter = {_id:new ObjectId(boundedUserId)}
    const userUpdate = {
        $push: {user_groups_ids:groupId}
    }

    const group_filter = {_id: new ObjectId(groupId)}
    const groupUpdate = {$push:{group_users:boundedUserId}}
    try {
        if(typeof groupId === 'undefined' || typeof boundedUserId === 'undefined'){
            throw new Error
        } else {
            const groupsCollection = artificium_db.collection("Groups")
            const isUserAlreadyBoundedToGroup = await groupsCollection.find({_id:groupId, group_users: {$in: [boundedUserId]}}).toArray()
            if(isUserAlreadyBoundedToGroup.length > 0) {
                // użytkownik już jest połączony z tą grupą jako jej uczestnik
                return "ALREADY_BOUNDED"
            } else {
                const userUpdateResult = await artificium_db.collection("Users").updateOne(user_filter, userUpdate)
                const groupUserArrUpdateResult = await groupsCollection.updateOne(group_filter, groupUpdate)       
                if( userUpdateResult.modifiedCount === 0 || groupUserArrUpdateResult.modifiedCount === 0) {
                    return "MODIFY_ERROR"
                } else {
                    return "SUCCESS"
                }         
            }
        }
    } catch (error) {
        return "OVERALL_ERROR"
    }
}