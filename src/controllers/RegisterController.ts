//USER Register Handler

import { validateRegister } from "../utils/ValidateRegister"

const RequestDataValidation = (target:any, name:string | Symbol, descriptor:PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (req:any, res:any, ...args: any[]) { // Funkcja obsługująca
        console.log(req, res, args)
    };
    descriptor.value()
    // validateRegister()
}


export class RegisterController {
    
    @RequestDataValidation
    static register(text:string = "Sdasd", req:any, res:any) {
        console.log(req.body)
        res.json("daa")
    }
}

Object.defineProperty(RegisterController, "register", {
    value: RequestDataValidation(RegisterController, "register", Object.getOwnPropertyDescriptor(RegisterController, "register")),
    writable: true,
    enumerable: false,
    configurable: true,
  });