import { ChatRoomMessageJSON } from "../../../domain/entities/chat-room-message.model";
import { ChatRoomModelJSON } from "../../../domain/entities/chatroom.model";
import { UserWithAuthCredJSON } from "../../../domain/entities/user.model";

export const transformDbResultToObject = (resultArray: Array<any>): UserWithAuthCredJSON =>{
    return {
        id: resultArray[0],
        firstname: resultArray[1],
        lastname: resultArray[2],
        email: resultArray[3],
        dob: resultArray[4],
        passwordHash: resultArray[5],
        pic: resultArray[6]
    }
}

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