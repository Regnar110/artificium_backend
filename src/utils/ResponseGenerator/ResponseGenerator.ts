export const ResponseGenerator = (responseType: "SUCCESS" | "ERROR") => {

    if(responseType==="ERROR") {
        return <ResponseType>(status:number, error_message:string, client_message:string):ResponseType => {
            return {
                error_message,
                client_message,
                status,
            } as ResponseType
        }
    } else if(responseType==="SUCCESS") {
        return <ResponseType>(status:number, client_message:string, body?:any):ResponseType => {
            return {
                client_message,
                status,
                body
            } as ResponseType
        }
    }
return 
}

export const SUCCESS_response = (status:number, client_message:string, body?:any):SuccesResponseType => ({
    client_message,
    status,
    body
})

export const ERROR_response = (status:number, error_message:string, client_message:string):ErrorResponseType => ({
    status,
    error_message,
    client_message,
})