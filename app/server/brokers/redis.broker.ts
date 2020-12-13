import { RedisCache } from "../../data/datasources/redis.cache";
import { MessageBrokerSpec } from "./contracts/broker.interface";
import { Message } from "./contracts/message.interface";

export class RedisMessageBroker implements MessageBrokerSpec {
    
    constructor(
        private redisCache: RedisCache
    ) { }

    async publish(message: Message, channel: string, opts?: any): Promise<any> {
        await this.redisCache.produce(channel, message.data);
    }

    disconnect(): any {
        this.redisCache.unsubscribe();
    }

    subscribe(channel: string, consumer: any, opts?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.redisCache.subscribe(channel, consumer);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

}