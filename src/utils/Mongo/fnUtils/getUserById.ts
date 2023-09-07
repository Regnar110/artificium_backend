import { MongoClient, ObjectId } from "mongodb";

export const getUserById = async (userId:string, mongo:MongoClient) => {
    try {
        const db = mongo.db("Artificium")
        const collection = db.collection("Users")
        const findResult = await collection.findOne({_id: new ObjectId(userId)} ,{ projection: {password: 0}})
        console.log(findResult)
        return findResult
    } catch (error) {
        
    }

}