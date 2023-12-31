import { MongoClient, ObjectId } from "mongodb";

export const getUserById = async (userId:ObjectId, mongo:MongoClient) => {
    try {
        const db = mongo.db("Artificium")
        const collection = db.collection("Users")
        const findResult = await collection.findOne({_id: userId} ,{ projection: {password: 0}})
        return findResult
    } catch (error) {
        return null
    }

}