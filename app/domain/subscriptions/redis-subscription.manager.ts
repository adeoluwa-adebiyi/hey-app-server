import { autoInjectable, inject } from "tsyringe";
import { RedisCache } from "../../data/datasources/redis.cache";
import { MessageBrokerSubscriptionsManagerSpec } from "./manager.interface";
import { MessageBrokerSubscriptionSpec } from "./subscriptions.interface";


@autoInjectable()
export class RedisSubscriptionManager implements MessageBrokerSubscriptionsManagerSpec{

    constructor(
        @inject("RedisCache") private redisClient: RedisCache
    ){}

    registerSubscriptions(subscriptions: MessageBrokerSubscriptionSpec[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    disconnectSubscription(event: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    disconnectSubscriptions(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}