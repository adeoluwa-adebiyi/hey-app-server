// import "reflect-metadata";
// import { container } from "tsyringe";
// import "../app/appregistry.registry";
// import { Kafka, KafkaConfig } from "kafkajs";
// import { MessageBrokerSpec } from "../app/server/brokers/contracts/broker.interface";
// import { KafkaJSMessageBroker } from "../app/server/brokers/kafkajs.broker";
// import { KAFKA_CLIENT_ID, KAFKA_BROKERS, KAFKA_SSL, KAFKA_USERNAME, KAFKA_PASSWORD } from "../app/config/app.config";
// import { expect } from "chai";


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

// const TOPIC = "gkjc89cx-message-notify";

// const consumer = kafka.consumer({ groupId: "test" });

// const publisher = kafka.producer();

// const broker: MessageBrokerSpec = new KafkaJSMessageBroker(kafka);


// const TEST_MESSAGE: any = {
//     topic: TOPIC,
//     messages: [
//         { value: 'Hello KafkaJS user!' },
//     ],
// }


// describe("Tests KafkaJS broker for functionality", () => {

//     it("Should publish messages to topics", (done) => {

//         let res: string = null;

//         (<KafkaJSMessageBroker>broker).initProducer().then((b) => {
//             consumer.connect().then((_) => {
//                 consumer.subscribe({ topic: TOPIC, fromBeginning: true }).then(() => {
//                     b.publish(TEST_MESSAGE.messages, TOPIC).then((_) => {
//                         console.log("PUBLISHED");
//                         consumer.run({
//                             eachMessage: async ({ topic, partition, message }) => {
//                                 const msg = JSON.parse(message.value.toString());
//                                 console.log("RECEIVED");
//                                 console.log(msg);
//                                 expect(JSON.stringify(msg[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
//                                 Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                                     done();
//                                 });
//                             },
//                         }).then(_ => { }).catch(e => {
//                             Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                                 done(e);
//                             });
//                         });
//                     });


//                 }).catch(e => {
//                     Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                         done(e);
//                     });
//                 });

//             }).catch((e) => consumer.disconnect().then((_) => {
//                 Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                     done(e);

//                 });
//             }));
//         });
//     });

//     it("Should subscribe to published messages", (done) => {
//         (<KafkaJSMessageBroker>broker).initConsumer("test").then(_ => {
//             publisher.connect().then((_) => {
//                 broker.subscribe(TOPIC, async (msg: any) => {
//                     const { topic, partition, message } = msg;
//                     expect(JSON.stringify(JSON.parse(message.value.toString())[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
//                     Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                         done();
//                     })
//                 }, { fromBeginning: true }).catch((e) => {
//                     Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                         done(e);
//                     })
//                 });
//                 publisher.send(TEST_MESSAGE).then((_) => { }).catch((e) => done(e));
//             }).catch((e) => {
//                 Promise.all([consumer.disconnect(), publisher.disconnect(), (<KafkaJSMessageBroker>broker).disconnect()]).then((_) => {
//                     done(e);
//                 })
//             });
//         });

//     });

// });