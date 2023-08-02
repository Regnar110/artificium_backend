import { Db } from "mongodb";
import dotenv from 'dotenv';
import { CreateGroupHandler } from "../utils/Decorators/DashBoardActions/CreateGroupHandler";
import { ResponseGenerator } from "../utils/ResponseGenerator/ResponseGenerator";
import { boundUserToGroup } from "../utils/GroupActionUtils/BoundUserToGroup";
export class UserDashBoardActions {

    @CreateGroupHandler
    static async createGroup(req:any, res:any, artificium_db:Db) {
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

    static async getUserGroups() {
        //Endpoint for fetching groups for selected user( if he is an admin or just a user)
    } 

    static async removeGroup() {
        // removeGroup - only for admin of the group. Group is deleted and connection to it is restricted
    }

    static async inviteToGroup() {
        // invite user to group. Each user can do this
    }
}

