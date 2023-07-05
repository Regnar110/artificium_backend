"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseGenerator = void 0;
const ResponseGenerator = (responseType) => {
    if (responseType === "ERROR") {
        return (status, error_message, client_message) => {
            return {
                error_message,
                client_message,
                status,
            };
        };
    }
    else if (responseType === "SUCCESS") {
        return (status, client_message, body) => {
            return {
                client_message,
                status,
                body
            };
        };
    }
    return;
};
exports.ResponseGenerator = ResponseGenerator;
