import { autoInjectable, inject } from "tsyringe";
import { KafkaMessageBrokerSpec } from "../../server/brokers/contracts/broker.interface";
import { MessageBrokerSubscriptionsManagerSpec } from "./manager.interface";
import { MessageBrokerSubscriptionSpec } from "./subscriptions.interface";
import { Kafka, Consumer } from "kafkajs";


@autoInjectable()
export class KafkaSubscriptionManager implements MessageBrokerSubscriptionsManagerSpec {

    private consumerMap: Map<string, Consumer> = new Map();

    constructor(
        private kafkaClient: Kafka
    ) { }

    disconnectSubscription(event: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.consumerMap.get(event).disconnect();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async disconnectSubscriptions(): Promise<void> {
        for (let consumer of this.consumerMap.values()) {
            await consumer.stop();
            await consumer.disconnect();
        }
    }

    async registerSubscriptions(subscriptions: MessageBrokerSubscriptionSpec[]): Promise<void> {

        console.log("CALLED REGISTER");

        await Promise.all(subscriptions.map((subscription) => {
            return new Promise(async (resolve) => {
                const consumer = this.kafkaClient.consumer({ groupId: "ws-sock-servers" });
                consumer.connect().then(() => {
                    consumer.subscribe({ topic: subscription.getEvent(), fromBeginning: false }).then(() => {
                        consumer.run({
                             eachMessage: async (payload) => {
                                 console.log("MESSAGE:");
                                 console.log(payload.message.value.toString())
                                 subscription.consumer(payload)} ,
                            }).then(() => {
                            this.consumerMap.set(subscription.getEvent(), consumer);
                            resolve();
                        });
                    });

                })

            })
        }));

    }

}