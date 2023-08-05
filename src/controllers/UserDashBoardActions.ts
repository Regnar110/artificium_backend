import { Db } from "mongodb";
import dotenv from 'dotenv';
import { CreateGroupHandler } from "../utils/Decorators/DashBoardActions/CreateGroupHandler";
import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator";
import { boundUserToGroup } from "../utils/GroupActionUtils/BoundUserToGroup";
export class UserDashBoardActions {

    @CreateGroupHandler
    static async createGroup(req:any, res:any, artificium_db:Db) {
        // Po dotarciu do tej ścieżki uruchamiany jest proces tworzenia grupy wraz z wiązaniem użytkownika, który tworzy tą grupę do tej właśnie grupy.
        try {
            if(!req.body.status) {
                const succesObject = ResponseGenerator("SUCCESS")!<SuccesResponseType>(200, "Group created successfuly!", req.body)
                res.status(200).json(succesObject)  
            } else {
                res.status(req.body.status).json(req.body)
            }            
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "CreateGroup Route: CreateGroup Route overall error", "CreateGroup route error")
            res.status(500).json(errorObject)
        }

    }

    static async getUserGroups(req:any, res:any, artificium_db:Db) {
        // ścieżka zwracająca aktywne grupy danego użytkownika.
        try {
            const groups = await artificium_db.collection("Groups").find({group_users: {$in: [req.body.user_id]}}).toArray()
            res.status(200).json(groups)
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "GetUserGroups Route: GetUserGroups Route overall error", "GetUserGroups route error")
            res.status(500).json(errorObject)
        }
    }


    static async removeGroup() {
        // removeGroup - only for admin of the group. Group is deleted and connection to it is restricted
    }

    static async inviteToGroup() {
        // invite user to group. Each user can do this
    }
}

