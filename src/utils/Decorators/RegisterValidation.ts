// import clientPromise from "../Mongo/ConnectMongo";
import { SecurePass } from "../Register/SecurePass";
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator";
import { checkUserExistence } from "../Register/CheckUserExistence";
import { Db } from "mongodb";

export const RegisterValidation = (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async (...args: any[]) => {
      try {
          const artificium_db = args[2] as Db;
          const artificium_users = artificium_db.collection("Users")
          const { nickname, register_password, email } = args[0].body;
          const securedPass = await SecurePass(register_password);
          const userExist = await checkUserExistence(email, nickname, artificium_users)
          if(userExist === false) {
            const userObject = {
              email,
              nickname,
              password: securedPass,
              avatar_id: "123",
              user_friends_ids: [],
              user_groups_ids: [],
            };              
            args[0].body=userObject
            return originalMethod.apply(target, args);            
          } else if(userExist!.status) {
            // const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "RegisterValidation Decorator: Decorator function error - user already exist", "User with selected email and nickname set already exist. Try another nickname or email.")
            args[0].body=userExist; // in this case userExist is errorObject which describes what happend in userExist check function
            return originalMethod.apply(target, args)
          }
      } catch (error) {
          const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "RegisterValidation Decorator: Decorator function error", "Registration Error")
          args[0].body = errorObject
          return originalMethod.apply(target, args) 
      }
    };
  };
   
  //Dekorator odpowiadający za kompletowanie obiektu użytkownika celem insertowania go jako dokument MOngo. 
  // Ma tu miejsce również hashowanie hasło z użyciem bcrypt.