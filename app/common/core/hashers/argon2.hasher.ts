import argon2 from "argon2";
import { autoInjectable, injectable } from "tsyringe";
import { StringHasherSpec, VerifiableStringHasherSpec } from "./contract/hasher.interface";

@autoInjectable()
export class Argon2Hasher implements VerifiableStringHasherSpec{

    async verify(hash: string, data: string): Promise<boolean> {
        try{
            return await argon2.verify(hash, data);
        }catch(e){
            return false;
        }
    }

    async hash(data: string): Promise<string>{
        return await argon2.hash(data);
    }

}