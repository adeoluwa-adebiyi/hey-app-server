import { ChatRoomModelJSON } from "../../../domain/entities/chatroom.model";

export function transformToChatModelJSON(json: any): ChatRoomModelJSON {
    // throw Error("Method not yet implemented");
    console.log(json);
    return {
        id: json.id,
        roomKey: json.room_key,
        userId: json.user_id
    }
}