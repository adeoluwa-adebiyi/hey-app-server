import { expect } from "chai";
import { transformToChatModelJSON, transfromToChatRoomMessageModelJSON } from "../app/data/repositories/postgresql/transformers";
import { ChatRoomMessageJSON } from "../app/domain/entities/chat-room-message.model";
import { ChatRoomModelJSON } from "../app/domain/entities/chatroom.model";
import { MESSAGE_DATA } from "./test.data";

describe("Tests Repository data transformers functionality", ()=>{
    
    it("Should correctly transform ChatRoomModel data to ChatRoomModelJSON", ()=>{
        const chatRoomData = {
            id:78,
            user_id: 99,
            room_key: "kjsdkuksjdjhdklhlkjlkds"
        }
        const modelJSON: ChatRoomModelJSON = transformToChatModelJSON(chatRoomData);
        expect(modelJSON.id).to.equal(chatRoomData.id);
        expect(modelJSON.userId).to.equal(chatRoomData.user_id);
        expect(modelJSON.roomKey).to.equal(chatRoomData.room_key);
    });

    it("Should correctly transform ChatRoomMessageModel data to ChatRoomMessageModelJSON", ()=>{
        const { id, sender, message, messageType, referencedMessage, chatRoomId } = MESSAGE_DATA;
        const data = {
            id: MESSAGE_DATA.id,
            chatroom_id: MESSAGE_DATA.chatRoomId,
            sender_id: MESSAGE_DATA.sender,
            message: MESSAGE_DATA.message,
            message_type: MESSAGE_DATA.messageType,
            referenced_message: MESSAGE_DATA.referencedMessage
        }
        const obj:ChatRoomMessageJSON = transfromToChatRoomMessageModelJSON(data);
        expect(obj.id).to.equal(id);
        expect(obj.message).to.equal(message);
        expect(obj.sender).to.equal(sender);
        expect(obj.messageType).to.equal(messageType);
        expect(obj.referencedMessage).to.equal(referencedMessage);
        expect(obj.chatRoomId).to.equal(chatRoomId);
    });
})