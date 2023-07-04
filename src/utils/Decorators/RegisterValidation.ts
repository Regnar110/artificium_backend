// import clientPromise from "../Mongo/ConnectMongo";
import clientPromise from "../Mongo/ConnectMongo";
import { SecurePass } from "../Register/SecurePass";

export const RegisterValidation = (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
  
    descriptor.value = async (...args: any[]) => {
      const { nickname, register_password, mail } = args[0].body;
      const securedPass = await SecurePass(register_password);
    //   const mongoClient = await clientPromise
    //   const users_col = mongoClient.db("Artificium").collection("Users")
      const userObject = {
        email: mail,
        nickname,
        password: securedPass,
        avatar_id: "123",
        user_friends_ids: [],
        user_groups_ids: [],
      };


      args[0].body=userObject
    //   target[name].client =  mongoClient;
    //   target[name].artificium_users = users_col
      // Wywołaj oryginalną metodę register. Target to klasa, w której znajduje się metoda a args to nowe parametry zmodyfikowane w drodze działania dekoratora.
      return originalMethod.apply(target, args);
    };
  };
   