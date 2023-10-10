// import clientPromise from "../Mongo/ConnectMongo";
import { SecurePass } from "../Register/SecurePass";
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator";
import { checkUserExistence } from "../Register/CheckUserExistence";

export const RegisterValidation = (target: any, name: string, descriptor: PropertyDescriptor) => {
  
    const originalMethod = descriptor.value;
    descriptor.value = async (...args: any[]) => {
      try {
          const { nickname, register_password, email, provider } = args[0].body;
          const securedPass = await SecurePass(register_password);
          const userExist = await checkUserExistence(email, nickname)
          if(userExist === false) { 
            // REQ.BODY STAJE SIĘ NOWYM OBIEKTEM UŻYTKWONIKA
            args[0].body={
              isOnline:false,
              isInactive:false,
              email,
              nickname,
              password: securedPass,
              provider,
              avatar_id: "123",
              user_friends_ids: [],
              user_groups_ids: [],
            };             
            return originalMethod.apply(target, args);            
          } else if(userExist!.status) {
            args[0].body=userExist; // in this case userExist is errorObject which describes what happend in userExist check function
            return originalMethod.apply(target, args)
          }
      } catch (error) {
          const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "RegisterValidation Decorator: Decorator function error", "Registration Error")
          args[0].body = errorObject
          return originalMethod.apply(target, args) 
      }
    };
  };
   
  //Dekorator odpowiadający za kompletowanie obiektu użytkownika celem insertowania go jako dokument MOngo. 
  // Ma tu miejsce również hashowanie hasło z użyciem bcrypt.