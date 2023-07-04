import clientPromise from "../Mongo/ConnectMongo";

export const AccessMongo = (db_name:string, collection_name:string) => {
    return (target:any, propertyKey:string, descriptor:PropertyDescriptor) => {
        const originalMethod = descriptor.value

        descriptor.value = async(...args:any[]) => {
            const mongoClient = await clientPromise
            const users_col = mongoClient.db(db_name).collection(collection_name)
            target[propertyKey].client =  mongoClient;
            target[propertyKey].artificium_users = users_col
            return originalMethod.apply(target, args)
        }
    }
}

//ACCES MONGO its a decorator which have onlye one function. Attached to method in class it allow to acces selected MONGO Daatabase and selected Collection in this Database.
//This decorator returns a mongoClient and artificium collection as a additional properties for a method whic we can handle with this.method.additionalProperty.