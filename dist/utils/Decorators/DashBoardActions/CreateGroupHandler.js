"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroupHandler = void 0;
const ResponseGenerator_1 = require("../../ResponseGenerator/ResponseGenerator");
const BoundUserToGroup_1 = require("../../GroupActionUtils/BoundUserToGroup");
const ConnectMongo_1 = require("../../Mongo/ConnectMongo");
const CreateGroupHandler = (target, name, descriptor) => {
    //Dekorator, który odpowiada za utworzenie nowego dokumentu grupy w kolekcjo Groups. 
    // Dodatkowo w ciele dekoratora znajduje się funkcja boundUserToGroup.
    // Ma ona za zadanie w tym dekoratorze dołączyć użytkownika (id) do grupy, która została utworzona. A w tej grupie dołączyć do tablicy uczestników id
    // użytkownika który tą grupę utworzył.
    // jeżeli nie powiedzie się tworznie dokumentu grupy, lub powiązanie z nią użytkownika klient otrzyma stosowny obiekt błędu i cała procedura tworzenia grupy zostanie cofnięta.
    const originalMethod = descriptor.value;
    descriptor.value = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        const [req, res, artificium_db] = args;
        try {
            const isGroupNameExist = yield (0, ConnectMongo_1.db_collection)("Groups").countDocuments({
                group_name: req.body.group_name // należy tutaj poprawić sprawdzenie po literach lowercase
            }, { limit: 1 });
            if (isGroupNameExist === 1) { // jeżeli taka grupa już instnieje
                const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(510, "CreateGroupHandler Decorator: Decorator function error", "Group with this name already exist.");
                args[0].body = errorObject;
                return originalMethod.apply(target, args);
            }
            else { // jeżeli taka grupa nie istnieje
                const newGroupTemplate = Object.assign(Object.assign({}, req.body), { active_users: [], group_users: [], group_invite_slugId: "" });
                const insertResult = yield (0, ConnectMongo_1.db_collection)("Groups").insertOne(newGroupTemplate);
                const boundResult = yield (0, BoundUserToGroup_1.boundUserToGroup)(insertResult.insertedId, req.body.group_admin);
                if (boundResult === 500) {
                    // błąd bloku try catch bounduserToGroup
                    (0, ConnectMongo_1.db_collection)("Groups").deleteOne({ _id: insertResult.insertedId }); // jeżeli status 500(błąd) usuń dokonany wpis w mongo db
                    const boundError = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(boundResult, "BoundUserToGroup: Utility function error", "BoundUserToGroup Error.");
                    args[0].body = boundError;
                    return originalMethod.apply(target, args);
                }
                else if (boundResult === 510) {
                    // błąd konkretnej funkcjonalnośći bounUserToGroup - np. użytkniwnik już jest przywiązany do grupy do której próbujemy go dodać
                    (0, ConnectMongo_1.db_collection)("Groups").deleteOne({ _id: insertResult.insertedId }); // jeżeli status 510(błąd) usuń dokonany wpis w mongo db
                    const boundError = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(boundResult, "BoundUserToGroup: Utility function error", "The group creation process could not be completed.");
                    args[0].body = boundError;
                    return originalMethod.apply(target, args);
                }
                else {
                    // udało stworzyć sie grupę oraz udało się powiązać do niej użytkownika.
                    args[0].body = {
                        insertResult,
                        inserted_group: newGroupTemplate
                    };
                    return originalMethod.apply(target, args);
                }
            }
        }
        catch (error) {
            const errorObject = (0, ResponseGenerator_1.ResponseGenerator)("ERROR")(500, "CreateGroupHandler Decorator: Decorator function error", "CreateGroupHandler Error.");
            args[0].body = errorObject;
            return originalMethod.apply(target, args);
        }
    });
};
exports.CreateGroupHandler = CreateGroupHandler;
