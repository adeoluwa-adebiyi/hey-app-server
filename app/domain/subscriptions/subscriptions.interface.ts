import { EachMessagePayload } from "kafkajs";


export type MessageBrokerEvent = string;

export interface GenericMessageBrokerConsumerParams {
    event: string;
    message: string;
}

export interface KafkaMessageBrokerConsumerParams extends EachMessagePayload { }

export interface RedisBrokerConsumerParams extends GenericMessageBrokerConsumerParams { };

export interface MessageBrokerSubscriptionSpec {
    getEvent(): MessageBrokerEvent;
    consumer(params: MessageBrokerConsumerParams): void;
}

export type MessageBrokerConsumerParams = GenericMessageBrokerConsumerParams | KafkaMessageBrokerConsumerParams | RedisBrokerConsumerParams;