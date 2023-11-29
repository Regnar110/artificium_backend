import { ObjectId } from "mongodb"
import { db_collection } from "../../Mongo/ConnectMongo"

export const propagateFriendship = async (_id1:string, _id2:string) => {
    const resultOne = await db_collection("Users").updateOne({_id: new ObjectId(_id1)}, {$push: {user_friends_ids: _id2}})
    const resultTwo = await db_collection("Users").updateOne({_id: new ObjectId(_id2)}, {$push: {user_friends_ids: _id1}})
    let operationOneResult;
    let operationTwoResult;
    switch(resultOne.modifiedCount) {
        case 0:
            operationOneResult = false;
            if(resultTwo.modifiedCount = 0)
            break;
        default: break;
    }

    switch(resultTwo.modifiedCount) {
        case 0:
            if(resultOne.modifiedCount = 1) {
                // cofnięcie zmian w użytkowniku result 1
            }
            break;
        default: break;
    }

}