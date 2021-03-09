import { model } from "mongoose";
import { autoInjectable, inject, singleton } from "tsyringe";
import { ChatRoomMessageJSON } from "../entities/chat-room-message.model";
import { ChatRoomModel, ChatRoomModelJSON, ChatRoomModelWithUserJSON } from "../entities/chatroom.model";
import { UserModel } from "../entities/user.model";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../repositories/repository.interface";
import { UseCaseSpec } from "./contracts/usecasespec.interface";


export interface GetUserChatRoomsUsecaseParams{
    userId: number;
}


export interface GetUserChatRoomsUsecaseResponse{
    chatRooms:Array<ChatRoomModelWithUserJSON>
}


@autoInjectable()
@singleton()
export class GetUserChatRoomsUsecase implements UseCaseSpec<Promise<GetUserChatRoomsUsecaseResponse>>{

    constructor(
        @inject("ChatRoomRepositorySpec") private chatRoomRepo?: ChatRoomRepositorySpec,
        @inject("UserRepositorySpec") private userRepo?: UserRepositorySpec
    ){}
    
    async execute(params: GetUserChatRoomsUsecaseParams):  Promise<GetUserChatRoomsUsecaseResponse>{
        // throw Error("Method not implemented");
        const { userId } = params;
        console.log("U_CHATROOMS:")
        console.log(userId);
        const response: ChatRoomModel[] = await this.chatRoomRepo.getUserChatRooms(await this.userRepo.getUserById({id: userId}));
        const fetched: ChatRoomModelWithUserJSON[] =  await Promise.all(response.map(async(model:ChatRoomModel)=>{
            const rooms:ChatRoomModel[] = await this.chatRoomRepo.getUserChatRoomsByRoomKey(model.roomKey);
            const room:ChatRoomModel = rooms.filter((_room:ChatRoomModel)=>_room.userId===userId?null:_room.userId)[0];
            const user:UserModel = await this.userRepo.getUserById({id: room.userId});
            const userJSON = {
                ...(model.toJSON()),
                user: {...(user.toJSON())}
            }
            return userJSON;
        }))
        return {
            chatRooms: fetched
        }
    }
}
