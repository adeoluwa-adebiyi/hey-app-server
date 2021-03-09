import { Message } from "./message.interface";

export interface MessageBrokerSpec{

    publish(message:Message, channel:String, opts?:any):Promise<any>;

    subscribe(channel:String, consumer:any, opts?:any): Promise<any>;

}

export interface KafkaMessageBrokerSpec extends MessageBrokerSpec{

    initProducer(): Promise<KafkaMessageBrokerSpec>;

    initConsumer(groupId?:string): Promise<KafkaMessageBrokerSpec>;

    disconnect(): Promise<void>;
    
}