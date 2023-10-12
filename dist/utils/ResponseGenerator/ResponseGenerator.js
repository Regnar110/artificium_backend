"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_response = exports.SUCCESS_response = exports.ResponseGenerator = void 0;
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
const SUCCESS_response = (status, client_message, body) => ({
    client_message,
    status,
    body
});
exports.SUCCESS_response = SUCCESS_response;
const ERROR_response = (status, error_message, client_message) => ({
    status,
    error_message,
    client_message,
});
exports.ERROR_response = ERROR_response;
