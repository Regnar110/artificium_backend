import { Db, ObjectId } from "mongodb"
import { ResponseGenerator } from "../../ResponseGenerator/ResponseGenerator"
import { boundUserToGroup } from "../../GroupActionUtils/BoundUserToGroup"

export const CreateGroupHandler = (target:any, name:string, descriptor:PropertyDescriptor) => {
    //Dekorator, który odpowiada za utworzenie nowego dokumentu grupy w kolekcjo Groups. 
    // Dodatkowo w ciele dekoratora znajduje się funkcja boundUserToGroup.
    // Ma ona za zadanie w tym dekoratorze dołączyć użytkownika (id) do grupy, która została utworzona. A w tej grupie dołączyć do tablicy uczestników id
    // użytkownika który tą grupę utworzył.
    // jeżeli nie powiedzie się tworznie dokumentu grupy, lub powiązanie z nią użytkownika klient otrzyma stosowny obiekt błędu i cała procedura tworzenia grupy zostanie cofnięta.

    const originalMethod = descriptor.value

    descriptor.value = async (...args:[any,any,Db]) => {
        const [ req, res, artificium_db ]  = args
        try {
            const groupsCollection = artificium_db.collection("Groups");
            const isGroupNameExist = await groupsCollection.countDocuments({
                group_name:req.body.group_name // należy tutaj poprawić sprawdzenie po literach lowercase
            }, {limit:1})
            if(isGroupNameExist === 1) { // jeżeli taka grupa już instnieje
                const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(510, "CreateGroupHandler Decorator: Decorator function error", "Group with this name already exist.")
                args[0].body = errorObject
                return originalMethod.apply(target, args)
            } else { // jeżeli taka grupa nie istnieje
                const newGroupTemplate = {
                    ...req.body,
                    group_users:[],
                    group_invite_slugId:""
                }
                const insertResult = await groupsCollection.insertOne(newGroupTemplate)
                const boundResult = await boundUserToGroup(artificium_db, insertResult.insertedId as ObjectId, req.body.group_admin as string)
                if(boundResult === 500 ) {
                    // błąd bloku try catch bounduserToGroup
                    groupsCollection.deleteOne({ _id: insertResult.insertedId }); // jeżeli status 500(błąd) usuń dokonany wpis w mongo db
                    const boundError = ResponseGenerator("ERROR")!<ErrorResponseType>(boundResult, "BoundUserToGroup: Utility function error", "BoundUserToGroup Error.")
                    args[0].body = boundError
                    return originalMethod.apply(target, args)
                } else if(boundResult===510) {
                    // błąd konkretnej funkcjonalnośći bounUserToGroup - np. użytkniwnik już jest przywiązany do grupy do której próbujemy go dodać
                    groupsCollection.deleteOne({ _id: insertResult.insertedId }); // jeżeli status 510(błąd) usuń dokonany wpis w mongo db
                    const boundError = ResponseGenerator("ERROR")!<ErrorResponseType>(boundResult, "BoundUserToGroup: Utility function error", "The group creation process could not be completed.")
                    args[0].body = boundError
                    return originalMethod.apply(target, args)
                } else {
                    // udało stworzyć sie grupę oraz udało się powiązać do niej użytkownika.
                   args[0].body = {
                    insertResult,
                    inserted_group: newGroupTemplate
                   }
                   return originalMethod.apply(target, args)
                }
            }
        } catch (error) {
            const errorObject = ResponseGenerator("ERROR")!<ErrorResponseType>(500, "CreateGroupHandler Decorator: Decorator function error", "CreateGroupHandler Error.")
            args[0].body = errorObject
            return originalMethod.apply(target, args)
        }

    }
}