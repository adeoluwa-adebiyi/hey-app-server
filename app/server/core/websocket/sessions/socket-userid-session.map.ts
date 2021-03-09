import { autoInjectable, inject } from "tsyringe";
import { UserAuthId } from "../../../../domain/entities/user.model";
import { SocketUserIdSessionMapSpec } from "./contracts/session.map.interface";

@autoInjectable()
export class SocketUserIdSessionMap implements SocketUserIdSessionMapSpec {

    private map: Map<string, UserAuthId> = new Map();


    constructor() {}

    reset(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.map.clear();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async get(key: string): Promise<UserAuthId> {

        return new Promise((resolve, reject) => {
            try {
                const result: UserAuthId = this.map.get(key);
                resolve(result?result:null);
            } catch (e) {
                reject(e);
            }
        });
    }

    async set(key: string, value: UserAuthId): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.map.set(key, value);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

}