import { ObjectId } from "mongodb";

interface UserMongoDocument {
    _id:ObjectId,
    email:string,
    nickname:string;
    password?:string;
    provider:string
    avatar_id:string;
    user_friends_ids: string[];
    user_groups_ids: string[];
}