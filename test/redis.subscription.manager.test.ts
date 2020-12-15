import "reflect-metadata";
import { expect } from "chai";
import { createClient, ClientOpts } from "redis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from "../app/config/app.config";
import { RedisCache } from "../app/data/datasources/redis.cache";
import { RedisSubscriptionsManager } from "../app/domain/subscriptions/redis-subscription.manager";
import { MessageBrokerSubscriptionSpec, RedisBrokerConsumerParams } from "../app/domain/subscriptions/subscriptions.interface";
import { MessageBrokerSpec } from "../app/server/brokers/contracts/broker.interface";
import { RedisMessageBroker } from "../app/server/brokers/redis.broker";

const TEST_MESSAGE: any = {
    messages: [
        { value: 'Hello KafkaJS user!' },
    ],
}

const TEST_MESSAGE_EVENT: string = "notify-message";

const redisCache: RedisCache = new RedisCache(createClient(<ClientOpts>{
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    db: 0,
    port: REDIS_PORT,
    url: REDIS_URL
}),
    createClient(<ClientOpts>{
        host: REDIS_HOST,
        password: REDIS_PASSWORD,
        db: 0,
        port: REDIS_PORT,
        url: REDIS_URL
    }),
    createClient(<ClientOpts>{
        host: REDIS_HOST,
        password: REDIS_PASSWORD,
        db: 0,
        port: REDIS_PORT,
        url: REDIS_URL
    })
);

const broker: MessageBrokerSpec = new RedisMessageBroker(redisCache);

const redisSubscriptionsManager: RedisSubscriptionsManager = new RedisSubscriptionsManager(redisCache);


describe("Tests RedisCacheSubsriptionManager for functionality", () => {

    it("Should publish messages to topics", (done) => {

        setTimeout(() => {

            class TestKMessageBrokerSubscription implements MessageBrokerSubscriptionSpec {

                getEvent(): string {
                    return TEST_MESSAGE_EVENT;
                }

                async consumer(params: RedisBrokerConsumerParams): Promise<void> {
                    console.log("PARAMS:");
                    console.log(params);
                    const { messages } = JSON.parse(params.message);
                    console.log("MESSAGES:");
                    console.log(messages);
                    const msg = messages;
                    expect(JSON.stringify(msg[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
                    done();
                    // (<RedisMessageBroker>broker).disconnect();
                }

            }

            redisSubscriptionsManager.registerSubscriptions([
                new TestKMessageBrokerSubscription()
            ]).then(async() => {
               broker.publish({data:TEST_MESSAGE}, TEST_MESSAGE_EVENT);
            });

        }, 5000);
    });

});