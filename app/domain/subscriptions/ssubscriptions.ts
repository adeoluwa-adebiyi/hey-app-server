import { autoInjectable, inject } from "tsyringe";
import { WebSocketServerSpec } from "../../server/core/websocket/websocket.webserver";
import { UserMessageNotifierSpec } from "../notifiers/user-notifier.interface";
import { NotifyNewMessage } from "../types/notify-new-message.type";
import { KafkaMessageBrokerConsumerParams, MessageBrokerConsumerParams, MessageBrokerSubscriptionSpec, RedisBrokerConsumerParams } from "./subscriptions.interface";

export const MB_NOTIFY_NEW_MESSAGE_EVENT:string = "gkjc89cx-message-notify";

@autoInjectable()
export class KChatMessageNotifierMessageBrokerSubscription implements MessageBrokerSubscriptionSpec{

    constructor(
        @inject("UserMessageNotifierSpec") private userNotifier?: UserMessageNotifierSpec
    ){}

    getEvent(): string {
        return MB_NOTIFY_NEW_MESSAGE_EVENT;
    }
    
    async consumer(params: KafkaMessageBrokerConsumerParams): Promise<void> {
        const { topic, message, partition } = params;
        console.log("BROKER:");
        console.log(message);
        const msg: NotifyNewMessage = JSON.parse(message.value.toString()).data;
        console.log(msg);
        const { destination } = msg;
        await this.userNotifier.notifyUser(destination, msg.message);
    }

}



@autoInjectable()
export class RedisChatMessageNotifierMessageBrokerSubscription implements MessageBrokerSubscriptionSpec{

    constructor(
        @inject("UserMessageNotifierSpec") private userNotifier?: UserMessageNotifierSpec
    ){}

    getEvent(): string {
        return MB_NOTIFY_NEW_MESSAGE_EVENT;
    }
    
    async consumer(params: RedisBrokerConsumerParams): Promise<void> {
        const { message } = params;
        console.log("BROKER:");
        console.log(message);
        const msg: NotifyNewMessage = JSON.parse(message);
        console.log(msg);
        const { destination } = msg;
        await this.userNotifier.notifyUser(destination, msg.message);
    }

} 