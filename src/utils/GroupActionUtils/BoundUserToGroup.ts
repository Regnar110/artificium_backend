import { Db, ObjectId } from "mongodb";
import { db_collection } from "../Mongo/ConnectMongo";

export const boundUserToGroup = async (groupId:ObjectId, boundedUserId:string) => {
    const user_filter = {_id:new ObjectId(boundedUserId)}
    const userUpdate = {
        $push: {user_groups_ids:groupId}
    }

    const group_filter = {_id: new ObjectId(groupId)}
    const groupUpdate = {$push:{group_users:boundedUserId}}
    
    try {
        if(typeof groupId === 'undefined' || typeof boundedUserId === 'undefined'){
            throw new Error
        } else {
            const isUserAlreadyBoundedToGroup = await db_collection("Groups").find({_id:groupId, group_users: {$in: [boundedUserId]}}).toArray()
            // sprawdzamy czy użytkownik należy już do grupy do której próbujemy go dodać.
            if(isUserAlreadyBoundedToGroup.length > 0) {
                // użytkownik już jest połączony z tą grupą jako jej uczestnik - sprawdzenie na wypadek próby ponownego dołączenia do grupy gdy jest się już jej uczestnikiem
                return 510
            } else { 
                const userUpdateResult = await db_collection("Users").updateOne(user_filter, userUpdate)
                // dodajemy do tablicy user_groups konkretnego użytkownika id grupy do której dołącza.
                const groupUserArrUpdateResult = await db_collection("Groups").updateOne(group_filter, groupUpdate)   
                // dodajemy do dokumentu grupy id użytkownika w tablicę przechowującą id uczestników grupy.    
                if( userUpdateResult.modifiedCount === 0 || groupUserArrUpdateResult.modifiedCount === 0) {
                    // Błąd po stronie mongo. Nie udało się aktualizować kolekcji.
                    return 510
                } else {
                    // Wszystkie operacje przebiegły pomyślnie
                    return 200
                }         
            }
        }
    } catch (error) {
        // Bład bloku try catch
        // jeden z propsów jest undefined lub w dalszej części coś poszło nie tak
        return 500
    }
}