// import "reflect-metadata";
// import { container } from "tsyringe";
// import "../app/appregistry.registry";
// import { Kafka, KafkaConfig, ConsumerConfig, ConsumerSubscribeTopic, ProducerConfig, EachMessagePayload } from "kafkajs";
// import { MessageBrokerSpec } from "../app/server/brokers/contracts/broker.interface";
// import { KafkaJSMessageBroker } from "../app/server/brokers/kafkajs.broker";
// import { KAFKA_CLIENT_ID, KAFKA_BROKERS, KAFKA_SSL, KAFKA_USERNAME, KAFKA_PASSWORD } from "../app/config/app.config";
// import { expect } from "chai";
// import { KafkaSubscriptionManager } from "../app/domain/subscriptions/kafkajs-subscription.manager";
// import { MB_NOTIFY_NEW_MESSAGE_EVENT } from "../app/domain/subscriptions/ssubscriptions";
// import { KafkaMessageBrokerConsumerParams, MessageBrokerSubscriptionSpec } from "../app/domain/subscriptions/subscriptions.interface";


// const kafka = new Kafka(<KafkaConfig>{
//     clientId: KAFKA_CLIENT_ID,
//     brokers: KAFKA_BROKERS.split(","),
//     ssl: true,
//     sasl: {
//         mechanism: "scram-sha-256",
//         username: KAFKA_USERNAME,
//         password: KAFKA_PASSWORD
//     },
// });

// const kafkaSubscriptionsManager: KafkaSubscriptionManager = new KafkaSubscriptionManager(kafka);


// const TOPIC = MB_NOTIFY_NEW_MESSAGE_EVENT;

// const broker: MessageBrokerSpec = new KafkaJSMessageBroker(kafka);


// const TEST_MESSAGE: any = {
//     topic: MB_NOTIFY_NEW_MESSAGE_EVENT,
//     messages: [
//         { value: 'Hello KafkaJS user!' },
//     ],
// }


// describe("Tests KafkaJS broker for functionality", () => {

//     before(async () => {

//     })

//     it("Should publish messages to topics", (done) => {

//         setTimeout(() => {

//             class TestKMessageBrokerSubscription implements MessageBrokerSubscriptionSpec {

//                 getEvent(): string {
//                     return MB_NOTIFY_NEW_MESSAGE_EVENT;
//                 }

//                 async consumer(params: KafkaMessageBrokerConsumerParams): Promise<void> {

//                     const { topic, partition, message } = params;
//                     const msg = JSON.parse(message.value.toString());
//                     expect(JSON.stringify(msg[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
//                     Promise.all([
//                         (<KafkaJSMessageBroker>broker).disconnect(),
//                         new Promise((resolve)=>{kafkaSubscriptionsManager.disconnectSubscriptions(); resolve()})
//                     ]).then((_)=>{
//                         done();
//                     })
                    
//                 }

//             }

//             kafkaSubscriptionsManager.registerSubscriptions([
//                 new TestKMessageBrokerSubscription()
//             ]).then(async() => {
//                 (await(<KafkaJSMessageBroker>broker).initProducer()).publish(TEST_MESSAGE.messages, TOPIC);
//             });

//         }, 5000);
//     });

// });