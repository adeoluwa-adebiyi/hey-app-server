import { RedisClient } from "redis";
import { Cache, Subscriber, Producer, SubscribedData } from "./datasource.interface";

export class RedisCache implements Cache, Subscriber, Producer {

    constructor(
        private client: RedisClient, 
        private pubClient: RedisClient, 
        private subClient: RedisClient
        ) { }

    produce(event: string, data: SubscribedData): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pubClient.publish(event, JSON.stringify(data), (err: Error, reply: number) => {
                if (err)
                    reject(err)
                else
                    resolve();
            })
        });
    }

    subscribe(event: string, subscriber: any) {
        this.subClient.subscribe(event, (data) => {
            console.log("XMSK")
            console.log(data);
            subscriber(data);
        })
    }

    reset(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.flushall('ASYNC', (err: Error, reply: string) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    get(resourceURI: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.get(resourceURI, (err: Error, reply: String) => {
                if (err)
                    reject(err);
                else
                    resolve(reply);
            })
        })
    }

    set(resourceURI: string, value: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getConnector().set(resourceURI, value, (err: Error, reply: String) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        })
    }

    disconnect() {
        this.client.quit();
        this.pubClient.quit();
        this.subClient.quit();
    }

    getConnector() {
        return this.client;
    }

}