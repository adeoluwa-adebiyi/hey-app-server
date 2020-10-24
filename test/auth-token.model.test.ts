import { expect } from "chai";
import { AuthTokenModel } from "../app/domain/entities/auth-tokens.model";

const  userCredentials = {
    accessToken: "ejjhjhkjhwkhw78hiund",
    refreshToken: "knkjniuehuehuhiheu65456"
}


describe("Tests AuthToken user model methods", ()=>{

    it("Should generate valid auth-token object from json", ()=>{
        const authToken = new AuthTokenModel().fromJSON(userCredentials);
        expect(JSON.stringify(authToken)).to.equal(JSON.stringify(userCredentials));
    })

});