import { Exception } from "./exception.interface";

export class BaseException extends Error{

    constructor(message: string, name="BaseException"){
        super(message);
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
    }

}