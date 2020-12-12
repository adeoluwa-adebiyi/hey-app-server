import { autoInjectable, inject } from "tsyringe";
import { RedisCache } from "../../data/datasources/redis.cache";
import { MessageBrokerSubscriptionsManagerSpec } from "./manager.interface";
import { MessageBrokerSubscriptionSpec, RedisBrokerConsumerParams } from "./subscriptions.interface";


@autoInjectable()
export class RedisSubscriptionsManager implements MessageBrokerSubscriptionsManagerSpec{

    constructor(
        @inject("RedisCache") private redisClient: RedisCache
    ){}

    async registerSubscriptions(subscriptions: MessageBrokerSubscriptionSpec[]): Promise<void> {
        await Promise.all(subscriptions.map(async(subscription)=> {
            return new Promise((resolve)=>{
                this.redisClient.subscribe(subscription.getEvent(), (data:string)=>{
                    console.log(data);
                    subscription.consumer(<RedisBrokerConsumerParams>{
                        event: subscription.getEvent(),
                        message:data
                    })
                });
                resolve();
            })
        }));
    }

    disconnectSubscription(event: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            this.redisClient.getSubscriber().unsubscribe(event, (err:Error, reply:string)=>{
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            })
        });
    }

    disconnectSubscriptions(): Promise<void> {

        return new Promise((resolve, reject)=>
        this.redisClient.getSubscriber().unsubscribe([],(err:Error, reply:string)=>{
            if(err){
                reject(err);
            }else{
                resolve();
            }
        }));
    }

}