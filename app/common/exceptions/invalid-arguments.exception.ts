import { BaseException } from "./base.exception";

export class InvalidArgumentsException extends BaseException{

    constructor(message: string){
        super(message, InvalidArgumentsException.name);
    }
}