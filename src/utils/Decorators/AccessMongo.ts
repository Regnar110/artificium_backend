// import clientPromise from "../Mongo/ConnectMongo";
// import { ResponseGenerator } from "../ResponseGenerator/ResponseGenerator";

// export const AccessMongo = (db_name:string, collection_name:string) => {
//     return (target:any, propertyKey:string, descriptor:PropertyDescriptor) => {
//         const originalMethod = descriptor.value

//         descriptor.value = async(...args:any[]) => {
//             try {
//                 const mongoClient = await clientPromise
//                 const users_col = mongoClient.db(db_name).collection(collection_name)
//                 target[propertyKey].client =  mongoClient;
//                 target[propertyKey].artificium_users = users_col
//                 return originalMethod.apply(target, args)                
//             } catch (error) {
//                 const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "AccesMongo Decorator: Probably MongoClient initialization error!", "Oops... Something went wrong. Contact us to solve this problem.")
//                 args[0].body = errorObject
//                 return originalMethod.apply(target, args)
//             }
//         }
//     }
// }

//ACCES MONGO its a decorator which have onlye one function. Attached to method in class it allow to acces selected MONGO Daatabase and selected Collection in this Database.
//This decorator returns a mongoClient and artificium collection as a additional properties for a method whic we can handle with this.method.additionalProperty.
// Wyłaczone z użytku ze względu na możliwość tworzenia wielu instancji klienta mongoDB co nie jest zalecane zgodnie z dokumentacją.
// zmiast tego stworzono klasę w connectMongo.ts, która na bazie wzroca singletona zajmuje się tylko inicjalizacją kilenta mongo i uniemożliwia jego ponowne utworzenie.