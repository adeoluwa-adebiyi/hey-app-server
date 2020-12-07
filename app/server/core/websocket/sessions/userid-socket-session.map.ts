import { Socket } from "socket.io";
import { autoInjectable, inject, injectable } from "tsyringe";
import { UserAuthId } from "../../../../domain/entities/user.model";
import { UserIdSocketSessionMapSpec } from "./contracts/session.map.interface";
import "reflect-metadata";
import { Cache } from "../../../../data/datasources/datasource.interface";
import { throws } from "assert";
import { isLiteralExpression } from "typescript";
import { response } from "express";


@autoInjectable()
export class UserIdSocketSessionMap implements UserIdSocketSessionMapSpec {

    private map: Map<number, Array<string>> = new Map();

    constructor() {}

    reset(): Promise<any> {
        return new Promise((resolve, reject)=>{
            try{
                this.map.clear();
                resolve();
            }catch(e){
                reject(e);
            }
        });
    }

    async get(key: UserAuthId): Promise<Array<string>> {
        console.log(key.id);
        console.log( this.map.get(key.id));
        return new Promise((resolve, reject)=>{
            try{
                const result:Array<string> = this.map.get(key.id);
                console.log("RESULT:");
                console.log(this.map.values());
                resolve(result?result:null);
            }catch(e){
                reject(e);            }
        });
    }

    async set(key: UserAuthId, value: string[]): Promise<void> {
        return new Promise((resolve, reject)=>{
            try{
                this.map.set(key.id,value);
                console.log("VALUES:");
                console.log(this.map.values());
                resolve();
            }catch(e){
                reject(e);
            }
        });
    }

}