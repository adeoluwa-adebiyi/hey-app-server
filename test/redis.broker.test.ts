import "reflect-metadata";
import "../app/appregistry.registry";
import { MessageBrokerSpec } from "../app/server/brokers/contracts/broker.interface";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from "../app/config/app.config";
import { expect } from "chai";
import { createClient, ClientOpts } from "redis";
import { RedisCache } from "../app/data/datasources/redis.cache";
import { RedisMessageBroker } from "../app/server/brokers/redis.broker";


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

const TEST_MESSAGE_EVENT: string = "notify-message";

const consumer = createClient(<ClientOpts>{
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    db: 0,
    port: REDIS_PORT,
    url: REDIS_URL
});

const publisher = createClient(<ClientOpts>{
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    db: 0,
    port: REDIS_PORT,
    url: REDIS_URL
});

const broker: MessageBrokerSpec = new RedisMessageBroker(redisCache);


const TEST_MESSAGE: any = {
    messages: [
        { value: 'Hello KafkaJS user!' },
    ],
}


describe("Tests Redis broker for functionality", () => {

    it("Should publish messages to topics", (done) => {

        try {

            consumer.subscribe(TEST_MESSAGE_EVENT, (err: Error, reply: string) => {

                consumer.on("message", (channel: string, data: string) => {
                    const serialized = JSON.parse(data);
                    const { messages } = serialized;
                    const msg = messages;
                    expect(JSON.stringify(msg[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
                    consumer.unsubscribe(TEST_MESSAGE_EVENT);
                    done();
                });

                broker.publish({ data: TEST_MESSAGE }, TEST_MESSAGE_EVENT);

            });

        } catch (e) {
            done(e);
        }

    });

    it("Should subscribe to published messages", (done) => {
        broker.subscribe(TEST_MESSAGE_EVENT, (data:string)=>{
            try{
                const serialized = JSON.parse(data);
                const { messages } = serialized;
                const msg = messages;
                expect(JSON.stringify(msg[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
                consumer.unsubscribe(TEST_MESSAGE_EVENT);
                done();
            }catch(e){
                done(e);
            }
        }).then((_)=>{
            publisher.publish(TEST_MESSAGE_EVENT, JSON.stringify(TEST_MESSAGE));
        }).catch(e=>done(e));
    });

});