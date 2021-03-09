import { ChatRoomMessageJSON } from "../entities/chat-room-message.model";
import { UserAuthId } from "../entities/user.model";

export interface NotifyNewMessage{
    destination: UserAuthId,
    message: ChatRoomMessageJSON
}