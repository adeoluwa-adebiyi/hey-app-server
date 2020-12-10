import { MB_NOTIFY_NEW_MESSAGE_EVENT } from "../app/domain/subscriptions/ssubscriptions";
import { MessageBrokerSubscriptionSpec } from "../app/domain/subscriptions/subscriptions.interface";

const TEST_MESSAGE: any = {
    topic: MB_NOTIFY_NEW_MESSAGE_EVENT,
    messages: [
        { value: 'Hello KafkaJS user!' },
    ],
}


describe("Tests RedisCacheSubsriptionManager for functionality", () => {

    before(async () => {

    })

    it("Should publish messages to topics", (done) => {

        setTimeout(() => {

            class TestKMessageBrokerSubscription implements MessageBrokerSubscriptionSpec {

                getEvent(): string {
                    return MB_NOTIFY_NEW_MESSAGE_EVENT;
                }

                async consumer(params: KafkaMessageBrokerConsumerParams): Promise<void> {

                    const { topic, partition, message } = params;
                    const msg = JSON.parse(message.value.toString());
                    expect(JSON.stringify(msg[0])).to.equal(JSON.stringify(TEST_MESSAGE.messages[0]));
                    Promise.all([
                        (<KafkaJSMessageBroker>broker).disconnect(),
                        new Promise((resolve)=>{kafkaSubscriptionsManager.disconnectSubscriptions(); resolve()})
                    ]).then((_)=>{
                        done();
                    })
                    
                }

            }

            kafkaSubscriptionsManager.registerSubscriptions([
                new TestKMessageBrokerSubscription()
            ]).then(async() => {
                (await(<KafkaJSMessageBroker>broker).initProducer()).publish(TEST_MESSAGE.messages, TOPIC);
            });

        }, 5000);
    });

});