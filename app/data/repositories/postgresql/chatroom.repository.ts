import { UserModel } from "../../../domain/entities/user.model";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../repository.interface";

import "reflect-metadata";
import { autoInjectable, inject } from "tsyringe";
import { DatabaseSpec } from "../../datasources/datasource.interface";
import { ChatRoomModel } from "../../../domain/entities/chatroom.model";
import { CHATROOM_TABLE_NAME, USER_TABLE_NAME } from "../../../config/app.config";
import { PostgresDatabase } from "../../datasources/postgres.database";
import { v4, v1 } from "uuid";
import { transformToChatModelJSON } from "./transformers";
import { Pool } from "pg";
import { response } from "express";

const CHAT_ROOM_TABLE = "chatroom";
const USER_TABLE = USER_TABLE_NAME;
// const CREATE_CHATROOM_QUERY = `INSERT into "${CHATROOM_TABLE_NAME}"(room_key, user_id)  VALUES( $2, ( SELECT id FROM bb where email=$1 )  ) RETURNING *`;
const CREATE_CHATROOM_QUERY = `SELECT * FROM bb where email = $1`;


@autoInjectable()
export class ChatRoomRepository implements ChatRoomRepositorySpec{

    constructor(
        @inject("DatabaseSpec") private database?: DatabaseSpec, 
        @inject("UserRepositorySpec") private userRepo?: UserRepositorySpec){}

    getChatRoom(chatRoomId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getUserChatRooms(user: UserModel): Promise<Array<ChatRoomModel>> {
        throw new Error("Method not implemented.");
    }
    async createChatRoom(users: UserModel[]): Promise<ChatRoomModel[]> {
        const chatRooms: Array<ChatRoomModel> = new Array<ChatRoomModel>();
        const roomKey = v1();
        console.log(`ROOM_KEY: ${roomKey}`);
        return Promise.all([...users.map((user)=>{
            console.log(`CHATROOM_USER: ${JSON.stringify(user.toJSON())}`);
            console.log(`EMAIL: ${user.email}`);
            const email = user.email;
            return new Promise((resolve, reject)=>{
                this.getDatabaseConnector().query(CREATE_CHATROOM_QUERY, [email])
                    .then((response:any)=>resolve(response))
                    .catch((e:any)=>reject(e));
            })
        })]).then((values)=>{
            console.log("VALUES:");
            console.log(values);
            return values.map((chatRoom:any)=>new ChatRoomModel().fromJSON(transformToChatModelJSON( chatRoom.row)));
        });
    }
    deleteChatRoom(chatRoomId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getDatabaseConnector() {
        return this.database.getConnector();
    }

}