import { BaseException } from "./base.exception"

export class InvalidLoginCredentialsException extends BaseException{
    constructor(message: string){
        super(message, InvalidLoginCredentialsException.name);
    }

}