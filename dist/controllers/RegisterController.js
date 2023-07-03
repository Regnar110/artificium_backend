"use strict";
//USER Register Handler
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const RequestDataValidation = (target, name, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (req, res, ...args) {
        console.log(req, res, args);
    };
    descriptor.value();
    // validateRegister()
};
class RegisterController {
    static register(text = "Sdasd", req, res) {
        console.log(req.body);
        res.json("daa");
    }
}
__decorate([
    RequestDataValidation
], RegisterController, "register", null);
exports.RegisterController = RegisterController;
Object.defineProperty(RegisterController, "register", {
    value: RequestDataValidation(RegisterController, "register", Object.getOwnPropertyDescriptor(RegisterController, "register")),
    writable: true,
    enumerable: false,
    configurable: true,
});
