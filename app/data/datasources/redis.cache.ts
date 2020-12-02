import { RedisClient } from "redis";
import { Cache } from "./datasource.interface";

export class RedisCache implements Cache {

    constructor(private client: RedisClient) { }

    reset():Promise<void> {
        return new Promise((resolve, reject)=>{
            this.client.flushall('ASYNC', (err:Error,reply:string)=>{
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    get(resourceURI: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.client.get(resourceURI,(err:Error, reply:String)=>{
                if(err)
                    reject(err);
                else
                    resolve(reply);
            })
        })
    }

    set(resourceURI: string, value: any): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.getConnector().set(resourceURI, value,(err:Error, reply:String)=>{
                if(err)
                    reject(err);
                else
                    resolve(true);
            });
        })
    }

    disconnect() {
        this.client.quit();
    }

    getConnector() {
        return this.client;
    }

}