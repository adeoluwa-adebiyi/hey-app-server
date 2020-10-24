import { autoInjectable, inject, injectable } from "tsyringe";
import { Argon2Hasher } from "./argon2.hasher";
import argon2 from "argon2";
import { PasswordHasherSpec, StringHasherSpec, VerifiableStringHasherSpec } from "./contract/hasher.interface";

@autoInjectable()
export class Argon2PasswordHasher implements PasswordHasherSpec{

    constructor(private hasher?: Argon2Hasher){}

    async hashPassword(password: string): Promise<string>{
        return await this.hasher.hash(password);
    }

    async verifyPassword(hash: string, password: string): Promise<boolean> {
        return this.hasher.verify(hash, password);
    }
    
}