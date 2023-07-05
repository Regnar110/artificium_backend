interface SuccesResponseType {
    client_message:string;
    status:number,
    body?:any
}

interface ErrorResponseType {
    error_message:string
    client_message:string;
    status:number
}