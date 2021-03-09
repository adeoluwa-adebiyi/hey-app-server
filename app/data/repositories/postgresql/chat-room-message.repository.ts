import { autoInjectable, inject, singleton } from "tsyringe";
import { ChatRoomMessageModel } from "../../../domain/entities/chat-room-message.model";
import { ChatRoomMessageRepositorySpec } from "../../../domain/repositories/repository.interface";
import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseSpec } from "../../datasources/datasource.interface";
import { IClient } from "pg-promise/typescript/pg-subset";
import { IConnected } from "pg-promise";
import { CHATROOM_TABLE_NAME, CHAT_ROOM_MESSAGE_TABLE_NAME, USER_TABLE_NAME } from "../../../config/app.config";
import { transfromToChatRoomMessageModelJSON } from "./transformers";
import { ObjectNotFoundException } from "../../../common/exceptions/object-not-found.exception";

// id
// message,
// sender,
// messageType,
// referencedMessage,
// chatRoomId


const GET_CHATROOM_MESSAGES_QUERY = `SELECT *,created::timestamptz FROM ${CHAT_ROOM_MESSAGE_TABLE_NAME} WHERE chatroom_id = $1 ORDER BY created DESC LIMIT $2 OFFSET $3`;

const GET_CHATROOM_MESSAGE_BY_ID_QUERY = `SELECT *,created::timestamptz FROM ${CHAT_ROOM_MESSAGE_TABLE_NAME} WHERE id = $1`;

const POST_CHATROOM_MESSAGE_QUERY = `INSERT into ${CHAT_ROOM_MESSAGE_TABLE_NAME}(sender_id, message, message_type, chatroom_id, referenced_message, created) 
VALUES(
    ( SELECT id FROM ${USER_TABLE_NAME} WHERE id = $1 ), 
    $2, 
    $3, 
    ( SELECT DISTINCT(room_key) FROM ${CHATROOM_TABLE_NAME} WHERE room_key = $4 ), 
    $5,
    $6
) RETURNING *` ;


const DELETE_CHATROOM_MESSAGE_BY_ID_QUERY = `DELETE FROM ${CHAT_ROOM_MESSAGE_TABLE_NAME} WHERE id = $1`;



@autoInjectable()
@singleton()
export class ChatRoomMessageRepository implements ChatRoomMessageRepositorySpec{

    constructor(@inject("DatabaseSpec") private database: DatabaseSpec){}

    async getChatRoomMessages(roomKey: string, limit: number=50, offset:number = 0): Promise<ChatRoomMessageModel[]> {
        const response =  await (this.getDatabaseConnector()).query(GET_CHATROOM_MESSAGES_QUERY, [roomKey, limit, offset]);
        return response.map((json:any)=>new ChatRoomMessageModel().fromJSON(transfromToChatRoomMessageModelJSON(json)));
    }

    async getChatRoomMessage(id: number): Promise<ChatRoomMessageModel> {
        const response = await (this.getDatabaseConnector()).query(GET_CHATROOM_MESSAGE_BY_ID_QUERY, [id]);
        if(response.length===0)
            throw new ObjectNotFoundException(`ChatRoomMessageModel with id: ${id} not found.`);
        return new ChatRoomMessageModel().fromJSON(transfromToChatRoomMessageModelJSON(response));
    }

    async deleteChatRoomMessage(id: number): Promise<any> {
        return await (this.getDatabaseConnector()).query(DELETE_CHATROOM_MESSAGE_BY_ID_QUERY, [id]);
    }

    async postMessage(message: ChatRoomMessageModel): Promise<ChatRoomMessageModel> {
        const response =  await (this.getDatabaseConnector()).query(POST_CHATROOM_MESSAGE_QUERY, [
            message.sender, 
            message.message, 
            message.messageType, 
            message.chatRoomId, 
            message.referencedMessage,
            message.time
        ]);
        const result = new ChatRoomMessageModel().fromJSON(transfromToChatRoomMessageModelJSON(response[0]));
        return result;
    }

    getDatabaseConnector(): IConnected<{}, IClient> {
       return this.database.getConnector();
    }

}