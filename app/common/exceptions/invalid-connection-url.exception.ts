import { BaseException } from "./base.exception"

export class InvalidConnectionURLException extends BaseException{
    constructor(message: string){
        super(message, InvalidConnectionURLException.name);
    }
}