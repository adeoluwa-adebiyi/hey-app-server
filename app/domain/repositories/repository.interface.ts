import { QueryResult } from "pg";
import { ChatRoomMessageModel } from "../entities/chat-room-message.model";
import { ChatRoomModel } from "../entities/chatroom.model";
import { UserAuthId, UserModel } from "../entities/user.model";

export interface BaseRepository{

    getDatabaseConnector():any;

}

export interface UserRepositorySpec extends BaseRepository{

    deleteUser(userCredentials: any): Promise<any>;

    getUserById(id:UserAuthId): Promise<UserModel>;

    createUser(userCredential: any): Promise<UserModel>;

}


export interface ChatRoomRepositorySpec extends BaseRepository{

    getChatRoom(chatRoomId: number): Promise<ChatRoomModel>;

    getUserChatRooms(user: UserModel): Promise<Array<ChatRoomModel>>;

    createChatRoom(users: Array<UserModel>): Promise<Array<ChatRoomModel>>;

    deleteChatRoom(chatRoomId: number): Promise<void>;

    deleteChatRoomByRoomKey(roomKey: string): Promise<void>;

    getUserChatRoomsByRoomKey(roomKey: string): Promise<Array<ChatRoomModel>>;

}


export interface ChatRoomMessageRepositorySpec extends BaseRepository{

    getChatRoomMessages(roomKey:string, limit?:number, offset?:number): Promise<Array<ChatRoomMessageModel>>;

    deleteChatRoomMessage(id:number): Promise<any>;

    getChatRoomMessage(id: number): Promise<ChatRoomMessageModel>;

    postMessage(message: ChatRoomMessageModel): Promise<ChatRoomMessageModel>;

}