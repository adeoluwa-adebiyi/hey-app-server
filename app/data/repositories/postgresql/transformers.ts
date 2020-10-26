import { ChatRoomModelJSON } from "../../../domain/entities/chatroom.model";

export function transformToChatModelJSON(json: any): ChatRoomModelJSON {
    return {
        id: json.id,
        roomKey: json.room_key,
        userId: json.user_id
    }
}