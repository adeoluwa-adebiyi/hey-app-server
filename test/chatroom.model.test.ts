import { expect } from "chai";
import { ChatRoomModel } from "../app/domain/entities/chatroom.model";
import { USER_REGISTRATION_CREDENTIALS } from "./test.data";

const userRegCredentials:any = USER_REGISTRATION_CREDENTIALS;

const MOCK_CHATROOM_JSON = {
    id: 67,
    roomKey: "phik76353",
    userId:53
}

describe("Tests ChatRoomModel functionality", ()=>{

    const {id, roomKey, userId} = MOCK_CHATROOM_JSON;

    it("Should generate valid ChatRoomModels from JSON", ()=>{
        expect(JSON.stringify(new ChatRoomModel().fromJSON({...MOCK_CHATROOM_JSON}).toJSON())).to.equal(JSON.stringify(MOCK_CHATROOM_JSON));
    });

});