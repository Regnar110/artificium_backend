// import clientPromise from "../Mongo/ConnectMongo";
import { SecurePass } from "../Register/SecurePass";
import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator";

export const RegisterValidation = (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async (...args: any[]) => {
      try {
          const { nickname, register_password, mail } = args[0].body;
          const securedPass = await SecurePass(register_password);
          const userObject = {
            email: mail,
            nickname,
            password: securedPass,
            avatar_id: "123",
            user_friends_ids: [],
            user_groups_ids: [],
          };              
          args[0].body=userObject
          return originalMethod.apply(target, args);
      } catch (error) {
          const errorObject = ResponseGenerator<ErrorResponseType>("ERROR")!(500, "RegisterValidation Decorator: Decorator function error", "Registration Error")
          args[0].body = errorObject
          return originalMethod.apply(target, args) 
      }
    };
  };
   
  //Dekorator odpowiadający za kompletowanie obiektu użytkownika celem insertowania go jako dokument MOngo. 
  // Ma tu miejsce również hashowanie hasło z użyciem bcrypt.