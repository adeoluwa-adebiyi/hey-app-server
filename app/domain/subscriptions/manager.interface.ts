import { MessageBrokerSubscriptionSpec } from "./subscriptions.interface";

export interface MessageBrokerSubscriptionsManagerSpec{
    registerSubscriptions(subscriptions:Array<MessageBrokerSubscriptionSpec>): Promise<void>;
    disconnectSubscription(event:string): Promise<void>;
    disconnectSubscriptions(): Promise<void>;
}