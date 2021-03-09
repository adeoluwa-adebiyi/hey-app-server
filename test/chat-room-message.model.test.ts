import { expect } from "chai";
import { ChatRoomMessageModel, ChatRoomMessageJSON } from "../app/domain/entities/chat-room-message.model";
import { MESSAGE_DATA } from "./test.data";

describe("Test ChatRoomMessageModel for functionality", ()=>{

    const { id, sender, message, messageType, referencedMessage, chatRoomId, time } = MESSAGE_DATA;

    it("Should correctly serialize a ChatRoomMessage to ChatRoomMessageJSON", ()=>{
        const json: ChatRoomMessageJSON = new ChatRoomMessageModel(
            id,
            message,
            sender,
            messageType,
            referencedMessage,
            chatRoomId,
            time
        ).toJSON();
        expect(json.id).to.equal(id);
        expect(json.message).to.equal(message);
        expect(json.sender).to.equal(sender);
        expect(json.messageType).to.equal(messageType);
        expect(json.referencedMessage).to.equal(referencedMessage);
        expect(json.chatRoomId).to.equal(chatRoomId);
        expect(json.time).to.equal(time);
    });

    it("Should correctly serialize a ChatRoomMessage to ChatRoomMessageJSON", ()=>{
        const obj: ChatRoomMessageModel = new ChatRoomMessageModel().fromJSON({...MESSAGE_DATA});
        expect(obj.id).to.equal(id);
        expect(obj.message).to.equal(message);
        expect(obj.sender).to.equal(sender);
        expect(obj.messageType).to.equal(messageType);
        expect(obj.referencedMessage).to.equal(referencedMessage);
        expect(obj.chatRoomId).to.equal(chatRoomId);
        expect(obj.time).to.equal(time);
    });
})