import argon2 from "argon2"
import { expect } from "chai";
import "reflect-metadata";
import { Argon2Hasher } from "../app/common/core/hashers/argon2.hasher";
import { invalidArgon2PasswordHash, passwordTestData } from "./test.data";

const data: string = passwordTestData;

const invalidHash = invalidArgon2PasswordHash;

describe("Tests Argon2 hashing utility", ()=>{

    it("Should provide a valid one way argon2 hash", async()=>{
        expect(await argon2.verify(await new Argon2Hasher().hash(data), data)).to.equal(true);
    });

    it("Should detect a valid argon2 hash", async()=>{
        expect(await new Argon2Hasher().verify(await argon2.hash(data), data)).to.equal(true);
    });

    it("Should detect an invalid argon2 hash", async()=>{
        expect(await new Argon2Hasher().verify(invalidHash, data)).to.equal(false);
    });

})