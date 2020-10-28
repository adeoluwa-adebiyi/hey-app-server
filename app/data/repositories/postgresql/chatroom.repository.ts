import { UserModel } from "../../../domain/entities/user.model";

import "reflect-metadata";
import { autoInjectable, inject } from "tsyringe";
import { DatabaseSpec } from "../../datasources/datasource.interface";
import { ChatRoomModel, ChatRoomModelJSON } from "../../../domain/entities/chatroom.model";
import { CHATROOM_TABLE_NAME, DB_HOST, USER_TABLE_NAME } from "../../../config/app.config";
import { PostgresDatabase } from "../../datasources/postgres.database";
import { v4, v1 } from "uuid";
import { transformToChatModelJSON } from "./transformers";
import { Pool } from "pg";
import { response } from "express";
import { ObjectNotFoundException } from "../../../common/exceptions/object-not-found.exception";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../../../domain/repositories/repository.interface";

const CHAT_ROOM_TABLE = "chatroom";
const USER_TABLE = USER_TABLE_NAME;
const CREATE_CHATROOM_QUERY = "INSERT into chatroom(room_key, user_id)  VALUES( ${roomKey}, ( SELECT id FROM bb where email = ${email} )  ) RETURNING *";
const GET_USER_CHAT_ROOMS_QUERY = "SELECT * FROM chatroom WHERE user_id = $1";
const DELETE_USER_CHAT_ROOM_BY_ID = "DELETE FROM chatroom WHERE id = $1";
const GET_USER_CHAT_ROOMS_QUERY_BY_ID = "SELECT * FROM chatroom WHERE id = $1";

// const CREATE_CHATROOM_QUERY = `SELECT * FROM chatroom`;


@autoInjectable()
export class ChatRoomRepository implements ChatRoomRepositorySpec{

    constructor(
        @inject("DatabaseSpec") private database?: DatabaseSpec, 
        @inject("UserRepositorySpec") private userRepo?: UserRepositorySpec){}

    async getChatRoom(chatRoomId: number): Promise<ChatRoomModel> {
        const response = await (this.getDatabaseConnector()).query(GET_USER_CHAT_ROOMS_QUERY_BY_ID, [chatRoomId]);
        if(response.length===0)
            throw new ObjectNotFoundException(`ChatRoomModel with id: ${chatRoomId} not found`);
        return  new ChatRoomModel().fromJSON(transformToChatModelJSON(response[0]));
    }

    async getUserChatRooms(user: UserModel): Promise<Array<ChatRoomModel>> {
        const { id } = user.toJSON();
        const response = await (this.database.getConnector()).query(GET_USER_CHAT_ROOMS_QUERY, [id]);
        return response.map((chatRoomData:any)=> new ChatRoomModel().fromJSON(transformToChatModelJSON(chatRoomData)));
    }

    async createChatRoom(users: UserModel[]): Promise<ChatRoomModel[]> {
        const chatRooms: Array<ChatRoomModel> = new Array<ChatRoomModel>();
        const roomKey = v1();


        return Promise.all([...users.map(user=> new Promise<ChatRoomModel>((resolve, reject)=>{

            const email = user.email;

            this.getDatabaseConnector().query(CREATE_CHATROOM_QUERY, { email:email, roomKey: roomKey})
                    .then((response:any)=>{
                        resolve(new ChatRoomModel().fromJSON(transformToChatModelJSON(response[0])));
                    })
                    .catch((e:any)=>{
                        reject(e)});
            })
        )]);
    }

    async deleteChatRoom(chatRoomId: number): Promise<void> {
        try{
            await (this.database.getConnector()).query(DELETE_USER_CHAT_ROOM_BY_ID, [chatRoomId]);
        }catch(e){
            throw new ObjectNotFoundException(`ChatRoomModel with id: ${chatRoomId} not found`);
        }
    }

    getDatabaseConnector() {
        return this.database.getConnector();
    }

}