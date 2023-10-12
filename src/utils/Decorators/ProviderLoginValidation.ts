// DOSTAJE req.body z emailem.
// Najpierw sprwdzamy czy email istnieje. jeżeli istnieje zwracamy z bazy danych obiekt użytkownika.
// Jeżeli nie istnieje wysyłamy do klienta odpowiednią odpowiedź mówiącą mu otym że użytkownik z tym mailem nie jest zarejestrowany.
// potem po stronie klienta aplikacja prosi o nickname.
// gdy użytkownik poda nickname dochodzi rejestracji użytkownika z mailem i nicknamem
// gdy ten proces się zakończy użytkownik jest AUTHENTICATED. 
// Jezeli użytkownik nie poda maila, nasapi natycmmiadtowe zakończenie sesji po stronie klienta

import { WithId } from "mongodb";
import { ERROR_response } from "../ResponseGenerator/ResponseGenerator";
import { UserMongoDocument } from "../../globalTypings/userMongoDocument";
import { db_collection } from "../Mongo/ConnectMongo";

export const ProviderLoginValidation = (target:any, name:string, descriptor:PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = async (...args:any[]) => {
        try {
            const {email, provider} = args[0].body
            const userDocument = await db_collection("Users").findOne({email:email}) as WithId<UserMongoDocument>
            if(userDocument) {
                if(userDocument.provider !== provider) {
                    // Email istnieje, ale provider jest inny
                    const errorObject = ERROR_response(510, "ProviderLoginValidation Decorator: Decorator function error", "User with this email already exist! Provider is not correct")
                    args[0].body = errorObject
                    return originalMethod.apply(target, args)
                } else {
                    // Użytkownik istnieje, provider zgodny. Logowanie kontynuowane
                    const updateUserActivityStatus = await db_collection("Users").updateOne({
                        email:email
                    }, {
                        $set: {
                            isOnline: true
                        }
                    })
                    userDocument.isOnline = true
                    args[0].body = userDocument
                    return originalMethod.apply(target, args)
                }                
            } else {
                //Email nie istnieje. Rejestracja użytkownika i jego zwrot

                //REQ.BODY STAJE SIE NOWYM OBIEKTEM UZYTKOWNIKA
                args[0].body =  {
                    isOnline:true, // ponieważ następuje natychmiastowe udzielenie dostępu do dalszej części aplikacji
                    isInactive:false, 
                    ...args[0].body,
                    avatar_id:"1",
                    user_friends_ids:[],
                    user_groups_ids:[]

                }
                return originalMethod.apply(target, args)
            }

        } catch (error) {
            const errorObject = ERROR_response(500, "LoginValidation Decorator: Decorator function error", "Login Error")
            args[0].body = errorObject
            return originalMethod.apply(target, args)
        }
    }
}