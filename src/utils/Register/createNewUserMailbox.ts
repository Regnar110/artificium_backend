import { db_collection } from "../Mongo/ConnectMongo"

export const createNewUserMailbox = async (ownerId:string):Promise<string | false> => {
    const newMailboxObject = {
        ownerId,
        mails:[]
    }
    const insertResult =  await db_collection("Mailboxes").insertOne(newMailboxObject)
    if(insertResult.acknowledged) {
        return insertResult.insertedId.toString()
    } else return false
}