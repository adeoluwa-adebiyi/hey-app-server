import { QueryResult } from "pg";
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

}