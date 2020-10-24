import { Serializable } from "../../common/core/contracts/serializable.interface";

export interface ChatRoomModelProps{
    id?: number;
    roomKey: string;
    userId: number;
}

export interface ChatRoomModelJSON extends ChatRoomModelProps{}

export class ChatRoomModel implements ChatRoomModelProps ,Serializable<ChatRoomModelJSON>{
    id?: number;
    roomKey: string;
    userId: number;

    constructor(id:number=null, roomKey:string=null, userId:number=null){
        this.id = id;
        this.roomKey = roomKey;
        this.userId = userId;
    }

    toJSON():ChatRoomModelJSON {
        return {
            id: this.id,
            roomKey: this.roomKey,
            userId: this.userId
        }
    }
    fromJSON(json: ChatRoomModelJSON): ChatRoomModel {
        const { id, roomKey, userId } = json;
        return new ChatRoomModel(id, roomKey, userId);
    }

}