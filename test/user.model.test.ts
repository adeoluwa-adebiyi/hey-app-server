import { expect } from "chai";
import { describe } from "mocha";
import { UserModel } from "../app/domain/entities/user.model";

describe("Tests User model serialization property",()=>{

    const userModelObject:any = {
        id:1,
        firstname: "Austin",
        lastname:"Powell",
        dob: new Date(Date.now()).toLocaleDateString().replace("/","-").replace("/","-")
    };

    it("Should serialize User model to JSON",()=>{
        expect(new UserModel().fromJSON(userModelObject).toJSON(), userModelObject);
    });

    it("Should deserialize User model from JSON",()=>{
        expect(new UserModel().fromJSON(userModelObject).toJSON(), userModelObject);
    });

})