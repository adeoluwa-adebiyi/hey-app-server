import { BaseException } from "./base.exception"

export class ObjectNotFoundException extends BaseException{
    constructor(message: string){
        super(message, ObjectNotFoundException.name);
    }
}