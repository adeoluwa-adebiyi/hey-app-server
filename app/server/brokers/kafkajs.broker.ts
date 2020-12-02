import { KafkaMessageBrokerSpec } from "./contracts/broker.interface";
import { Message as IMessage } from "./contracts/message.interface";
import { Kafka, Producer, Consumer, Message } from "kafkajs";
import { autoInjectable, injectable } from "tsyringe";


@autoInjectable()
export class KafkaJSMessageBroker implements KafkaMessageBrokerSpec {

    private producer: Producer;
    private consumer: Consumer;
    private groupId: string;

    constructor(private kafkaClient?: Kafka) {
    }

    async initProducer(): Promise<KafkaJSMessageBroker> {
        this.producer = this.kafkaClient.producer();
        await this.producer.connect();
        return this;
    }

    async initConsumer(groupId?: string): Promise<KafkaJSMessageBroker> {
        this.groupId = groupId ? groupId : Math.random().toString();
        this.consumer = this.kafkaClient.consumer({groupId: this.groupId});
        await this.consumer.connect();
        return this;
    }

    publish(message: IMessage, channel: string, opts: any): Promise<any> {
        return this.producer.send({
            topic: channel,
            messages: [<Message>{
                value: JSON.stringify({ ...message })
            }]
        })
    }

    async subscribe(channel: string, consumer: any, opts: any): Promise<any>{
        await this.consumer.subscribe({topic:channel});
        return this.consumer.run({ eachMessage: consumer });
    }

    async disconnect(): Promise<void>{
        if(this.producer)
            await this.producer.disconnect();
        if(this.consumer)
            await this.consumer.disconnect()
    }

}