import { UserJSON, UserModel } from "../entities/user.model";
import { UseCaseSpec } from "./contracts/usecasespec.interface";
import "reflect-metadata";
import { autoInjectable, inject, singleton } from "tsyringe";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../repositories/repository.interface";
import { InvalidArgumentsException } from "../../common/exceptions/invalid-arguments.exception";
import { ObjectNotFoundException } from "../../common/exceptions/object-not-found.exception";
import { OperationCanceledException } from "typescript";
import { ChatRoomModel } from "../entities/chatroom.model";


export interface CreateChatRoomUsecaseResponse{
    roomKey: string;
    users: UserModel[];
}


export interface CreateChatRoomUsecaseParams{
    users: number[]
}


@autoInjectable()
@singleton()
export class CreateChatRoomUsecase implements UseCaseSpec<Promise<CreateChatRoomUsecaseResponse>>{

    constructor(
        @inject("ChatRoomRepositorySpec") private chatRoomRepository?: ChatRoomRepositorySpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec
    ){}

    async execute(params: CreateChatRoomUsecaseParams): Promise<CreateChatRoomUsecaseResponse> {
        const { users } = params;
        if(!users)
            throw new InvalidArgumentsException("users must be a valid list of UserModels")
        try{
            const registeredUsers = await Promise.all([...users.map(user=> this.userRepository.getUserById({id:user}))]);
            const response =  await this.chatRoomRepository.createChatRoom(registeredUsers);
            if(!response || response.length === 0)
                throw Error("Operation failed");
            const roomKey = response[0].roomKey;
            return {
                roomKey,
                users: registeredUsers
            }
        }catch(e){
            throw e;
        }
    }
}


export interface DeleteChatRoomUsecaseParams{
    roomKey: string;
}


@autoInjectable()
@singleton()
export class DeleteChatRoomUsecase implements UseCaseSpec<Promise<CreateChatRoomUsecaseResponse>>{

    constructor(@inject("ChatRoomRepositorySpec") private chatRoomRepository?: ChatRoomRepositorySpec){}

    async execute(params: DeleteChatRoomUsecaseParams): Promise<any> {
        const { roomKey } = params;
        if(!roomKey)
            throw new InvalidArgumentsException("roomKey cannot not be null")
        try{
            return await this.chatRoomRepository.deleteChatRoomByRoomKey(roomKey);
        }catch(e){
            throw e;
        }
    }
}


export interface ChatRoomResponseJSON{
    chatRoom: ChatRoomModel,
    users: UserJSON[]
}


export interface GetChatRoomByUserIdUseCaseResponse {
    chatRoom: ChatRoomResponseJSON
}


export interface GetChatRoomByUserIdParams{
    roomKey: string
}


@autoInjectable()
@singleton()
export class GetChatRoomByUserIdUseCase implements UseCaseSpec<Promise<GetChatRoomByUserIdUseCaseResponse>>{

    constructor(
        @inject("ChatRoomRepositorySpec") private chatRoomRepository?: ChatRoomRepositorySpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec
    ){}

    async execute(params: GetChatRoomByUserIdParams): Promise<GetChatRoomByUserIdUseCaseResponse> {
            const { roomKey } = params;
            const response = await this.chatRoomRepository.getUserChatRoomsByRoomKey(roomKey);
            const users = await Promise.all([...response.map((chatRoom: ChatRoomModel)=>this.userRepository.getUserById({id:chatRoom.userId}))]);
            return <GetChatRoomByUserIdUseCaseResponse>{
                chatRoom:<ChatRoomResponseJSON>{
                    chatRoom: {...response[0].toJSON(), userId:null},
                    users: users.map((user)=>user.toJSON())
                }
            }
    }

}