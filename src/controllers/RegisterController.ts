//USER Register Handler

import { Collection, MongoClient } from "mongodb"
import { RegisterValidation } from "../utils/Decorators/RegisterValidation"
import { AccessMongo } from "../utils/Decorators/AccessMongo"
export class RegisterController {

   
    @AccessMongo("Artificium", "Users") 
    @RegisterValidation 
    static async  register(req:any, res:any) {
        const { client, artificium_users }: {client:MongoClient, artificium_users:Collection<Document>} = this.register
        const result = await artificium_users.insertOne(req.body)
        res.json("daa")
    }

}
