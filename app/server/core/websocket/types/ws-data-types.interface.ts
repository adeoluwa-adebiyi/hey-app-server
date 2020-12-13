import { type } from "os";
import { ChatRoomMessageJSON, ChatRoomMessageModel } from "../../../../domain/entities/chat-room-message.model";
import { ChatRoomModelJSON } from "../../../../domain/entities/chatroom.model";
import { UserAuthId } from "../../../../domain/entities/user.model";

export interface WsErrorMsg{
    type: string;
    messages:Array<string>;
}

export type WsErrorMessage = WsErrorMsg ;

export type WsAuthErrorMsg = WsErrorMsg;

export type WsInternalErrorMsg = WsErrorMsg;

export type WsClientSendMessagePayload = ChatRoomMessageJSON;

export interface WsChatRoomNotificationMessage{
    sender: UserAuthId;
    destination: UserAuthId;
    message: ChatRoomMessageJSON;
}

export type NotificationMsg = WsChatRoomNotificationMessage;

export interface WsSuccessMsg{
    type: string;
    data: any;
}

export type WsMsg = WsErrorMsg | WsSuccessMsg;