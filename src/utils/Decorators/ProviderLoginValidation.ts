// DOSTAJE req.body z emailem.
// Najpierw sprwdzamy czy email istnieje. jeżeli istnieje zwracamy z bazy danych obiekt użytkownika.
// Jeżeli nie istnieje wysyłamy do klienta odpowiednią odpowiedź mówiącą mu otym że użytkownik z tym mailem nie jest zarejestrowany.
// potem po stronie klienta aplikacja prosi o nickname.
// gdy użytkownik poda nickname dochodzi rejestracji użytkownika z mailem i nicknamem
// gdy ten proces się zakończy użytkownik jest AUTHENTICATED. 
// Jezeli użytkownik nie poda maila, nasapi natycmmiadtowe zakończenie sesji po stronie klienta

import { Db, WithId } from "mongodb";
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator";
import { UserMongoDocument } from "../../globalTypings/userMongoDocument";

export const ProviderLoginValidation = (target:any, name:string, descriptor:PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = async (...args:any[]) => {
        try {
            const artificium_db = args[2] as Db;
            const artificium_users = artificium_db.collection("Users")
            const {email, provider} = args[0].body
            const userDocument = await artificium_users.findOne({email:email}) as WithId<UserMongoDocument>
            if(userDocument) {
                if(userDocument.provider !== provider) {
                    // Email istnieje, ale provider jest inny
                    const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "ProviderLoginValidation Decorator: Decorator function error", "User with this email already exist! Provider is not correct")
                    args[0].body = errorObject
                    return originalMethod.apply(target, args)
                } else {
                    // Użytkownik istnieje, provider zgodny. Logowanie kontynuowane
                    const updateUserActivityStatus = await artificium_users.updateOne({
                        email:email
                    }, {
                        $set: {
                            isOnline: true
                        }
                    })
                    console.log(updateUserActivityStatus)
                    args[0].body = userDocument
                    return originalMethod.apply(target, args)
                }                
            } else {
                //Email nie istnieje. Rejestracja użytkownika i jego zwrot
                const newUserObject = {
                    isOnline:true, // ponieważ następuje natychmiastowe udzielenie dostępu do dalszej części aplikacji
                    ...args[0].body,
                    avatar_id:"1",
                    user_friends_ids:[],
                    user_groups_ids:[]

                }
                args[0].body = newUserObject
                return originalMethod.apply(target, args)
            }

        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "LoginValidation Decorator: Decorator function error", "Login Error")
            args[0].body = errorObject
            return originalMethod.apply(target, args)
        }
    }
}