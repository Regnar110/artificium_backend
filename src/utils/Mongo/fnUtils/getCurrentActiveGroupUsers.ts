import { MongoClient, ObjectId } from "mongodb";
import { UserMongoDocument } from "../../../globalTypings/userMongoDocument";

export const getCurrentActiveGroupUsers = async (groupId:string, mongo:MongoClient):Promise<UserMongoDocument[]> => {
    const group_collection = mongo.db("Artificium").collection("Groups")
    const user_collection = mongo.db("Artificium").collection("Users")
    const [{active_users}] =  await group_collection.find({_id: new ObjectId(groupId)} , {projection: {active_users:1, _id:0}}).toArray()
    const active_users_objects = await user_collection.find({_id: {$in: active_users } }).toArray() as UserMongoDocument[]
    return active_users_objects 
}