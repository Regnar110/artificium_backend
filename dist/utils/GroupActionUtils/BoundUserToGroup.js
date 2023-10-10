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
exports.boundUserToGroup = void 0;
const mongodb_1 = require("mongodb");
const ConnectMongo_1 = require("../Mongo/ConnectMongo");
const boundUserToGroup = (groupId, boundedUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const user_filter = { _id: new mongodb_1.ObjectId(boundedUserId) };
    const userUpdate = {
        $push: { user_groups_ids: groupId }
    };
    const group_filter = { _id: new mongodb_1.ObjectId(groupId) };
    const groupUpdate = { $push: { group_users: boundedUserId } };
    try {
        if (typeof groupId === 'undefined' || typeof boundedUserId === 'undefined') {
            throw new Error;
        }
        else {
            const isUserAlreadyBoundedToGroup = yield (0, ConnectMongo_1.db_collection)("Groups").find({ _id: groupId, group_users: { $in: [boundedUserId] } }).toArray();
            // sprawdzamy czy użytkownik należy już do grupy do której próbujemy go dodać.
            if (isUserAlreadyBoundedToGroup.length > 0) {
                // użytkownik już jest połączony z tą grupą jako jej uczestnik - sprawdzenie na wypadek próby ponownego dołączenia do grupy gdy jest się już jej uczestnikiem
                return 510;
            }
            else {
                const userUpdateResult = yield (0, ConnectMongo_1.db_collection)("Users").updateOne(user_filter, userUpdate);
                // dodajemy do tablicy user_groups konkretnego użytkownika id grupy do której dołącza.
                const groupUserArrUpdateResult = yield (0, ConnectMongo_1.db_collection)("Groups").updateOne(group_filter, groupUpdate);
                // dodajemy do dokumentu grupy id użytkownika w tablicę przechowującą id uczestników grupy.    
                if (userUpdateResult.modifiedCount === 0 || groupUserArrUpdateResult.modifiedCount === 0) {
                    // Błąd po stronie mongo. Nie udało się aktualizować kolekcji.
                    return 510;
                }
                else {
                    // Wszystkie operacje przebiegły pomyślnie
                    return 200;
                }
            }
        }
    }
    catch (error) {
        // Bład bloku try catch
        // jeden z propsów jest undefined lub w dalszej części coś poszło nie tak
        return 500;
    }
});
exports.boundUserToGroup = boundUserToGroup;
