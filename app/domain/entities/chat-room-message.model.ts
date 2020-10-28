import { Serializable } from "../../common/core/contracts/serializable.interface";
import { ChatRoomModelJSON } from "./chatroom.model";


export enum ChatRoomMessageType{
    TEXT = "text",
    PICTURE = "picture",
    VIDEO = "video",
    AUDIO_CLIP = "audio_clip",
    DOCUMENT = "document"
}


export interface ChatRoomMessageJSON{
    id?: number;
    message: string;
    sender: number;
    messageType: ChatRoomMessageType,
    referencedMessage?: number,
    chatRoomId: number,
    time: string;
}


export class ChatRoomMessageModel implements Serializable<ChatRoomMessageModel>{

    id: number;
    message: string;
    sender: number;
    messageType: ChatRoomMessageType;
    referencedMessage: number;
    chatRoomId: number;
    time: string;

    constructor(id:number=null, message:string=null, sender:number=null, messageType:ChatRoomMessageType=null,referencedMessage: number=null, chatRoomId:number=null, time:string=null){
        this.id = id;
        this.message = message;
        this.sender = sender;
        this.messageType = messageType;
        this.referencedMessage = referencedMessage;
        this.chatRoomId = chatRoomId;
        this.time = time;
    }

    toJSON(): ChatRoomMessageJSON {
        return {
            id:this.id,
            message:this.message,
            sender:this.sender,
            messageType:this.messageType,
            referencedMessage:this.referencedMessage,
            chatRoomId: this.chatRoomId,
            time: this.time
        }
    }

    fromJSON(json: ChatRoomMessageJSON): ChatRoomMessageModel {
        const { id=null, message=null, sender=null, messageType=null, referencedMessage=null,chatRoomId=null, time=null } = json;
        return new ChatRoomMessageModel(id, message, sender, messageType, referencedMessage, chatRoomId, time);
    }

}