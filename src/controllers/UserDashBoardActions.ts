import { Db } from "mongodb";
import dotenv from 'dotenv';
export class UserDashBoardActions {
    static async createGroup(req:any, res:any, artificium_db:Db) {
        const groupCollection = artificium_db.collection("Groups")
    }
}

