export class BaseException extends Error{

    public message: string;

    constructor(message: string, name="BaseException"){
        super(message);
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}