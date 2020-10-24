import { expect } from "chai";
import { transformToChatModelJSON } from "../app/data/repositories/postgresql/transformers";
import { ChatRoomModelJSON } from "../app/domain/entities/chatroom.model";

describe("Tests Repository data transformers functionality", ()=>{
    it("Should correctly transform ChatRoomModel data tp ChatRoomModelJSON", ()=>{
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
})