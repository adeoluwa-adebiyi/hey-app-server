import { assert, expect } from "chai";
import { TokenAuthSpec } from "../app/server/contracts/tokenauthspec.interface";
import { JWTTokenAuthAlgorithm } from "../app/server/core/jwt-token.token-auth";
import "../app/appregistry.registry";
import { container } from "tsyringe";
import { claims } from "./test.data"

describe("Tests JWT Token Auth algorithm",()=>{


    const tokenAuthAlgorithm: TokenAuthSpec = container.resolve("TokenAuthSpec");
    const validToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJqdGkiOiI0ZGZmMThiMC1jZTZlLTQ5ZTMtYmIwYi0xZGQ4YjFhMDMzODUiLCJleHAiOjE2MDE2MDQ3MjN9.gEXxcc-g9bcSua4GIN_-Zx2B33gYY3TM5ni_-tAUn4Q";
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpkaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";


    it("Should generate jwts",()=>{
        expect(tokenAuthAlgorithm.generateToken(claims)).to.be.a('string');
    });

    it("Should detect valid jwt tokens", (done)=>{
        tokenAuthAlgorithm.verify(tokenAuthAlgorithm.generateToken(claims), (err:any, verifiedJWT:any)=>{
            console.log(err);
            assert.equal(err, null);
            done();
        });
    });
 
    it("Should detect invalid jwt tokens", (done)=>{
        tokenAuthAlgorithm.verify(invalidToken, (err: any, verifiedJWT:any)=>{
            expect(verifiedJWT).to.equal(undefined);
            done();
        })
    });

    it("Should correctly decode tokens", async()=>{

        let data = (await tokenAuthAlgorithm.decodeToken(tokenAuthAlgorithm.generateToken(claims))).body
        data = {sub:data.sub, name: data.name, iat: data.iat};
        expect(JSON.stringify(data)).to.equal(JSON.stringify(claims));
    });
})