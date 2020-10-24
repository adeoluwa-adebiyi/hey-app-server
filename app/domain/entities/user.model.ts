import { StringLiteral } from "typescript";
import { Serializable } from "../../common/core/contracts/serializable.interface";

export interface UserAuthId{
    id?: number;
    email?: string;
}

export interface UserWithAuthCredJSON extends UserJSON{
    passwordHash: string;
}

export interface UserJSON{
    id?: number;

    firstname?: string;

    lastname?: string;

    dob?: string;

    email: string;
}

export class UserModel implements Serializable<UserModel>{

     id: number;

     firstname: string;

     lastname: string;

     dob: Date;

     email: string;

     passwordHash: string;

    constructor(id:number=null, firstname: string=null, lastname: string=null, dob: Date=null, email: string=null, passwordHash:string = null){
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.dob = dob;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    toJSON(): UserJSON {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            dob: this.dob.toLocaleDateString(),
            email: this.email
        } 
    }

    toJSONWithAuthCred(): UserWithAuthCredJSON {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            dob: this.dob.toLocaleDateString(),
            email: this.email,
            passwordHash: this.passwordHash
        } 
    }
    
    fromJSON(json: any): UserModel {
        return new UserModel(json.id, json.firstname, json.lastname, new Date(json.dob), json.email, json.passwordhash?json.passwordhash:null);
    }
}