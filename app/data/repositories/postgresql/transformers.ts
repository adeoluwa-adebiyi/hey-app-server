import { ChatRoomMessageJSON } from "../../../domain/entities/chat-room-message.model";
import { ChatRoomModelJSON } from "../../../domain/entities/chatroom.model";

export const  transformToChatModelJSON = (json: any): ChatRoomModelJSON  => {
    return {
        id: json.id,
        roomKey: json.room_key,
        userId: json.user_id
    }
}


export const transfromToChatRoomMessageModelJSON = (jsonObj: any): ChatRoomMessageJSON => {
    const transformer = (json:any)=>{
        return  {
            id: json.id,
            sender: json.sender_id,
            message: json.message,
            messageType: json.message_type,
            referencedMessage: json.referenced_message,
            chatRoomId: json.chatroom_id,
            time: json.created
        }
    }
    const response = transformer(jsonObj);
    return response;
}