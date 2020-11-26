import { autoInjectable, inject, singleton } from "tsyringe";
import { ChatRoomMessageJSON, ChatRoomMessageModel, ChatRoomMessageType } from "../entities/chat-room-message.model";
import { ChatRoomMessageRepositorySpec, ChatRoomRepositorySpec, UserRepositorySpec } from "../repositories/repository.interface";
import { UseCaseSpec } from "./contracts/usecasespec.interface";
import { ChatRoomResponseJSON, GetChatRoomByUserIdUseCase } from "./create-chatroom.usecase";


export interface PostChatRoomMessageParams{
    message:string,
    sender:number,
    messageType:ChatRoomMessageType,
    referencedMessage: number,
    chatRoomId: string,
    time: string
}

export interface PostChatRoomMessageJSON extends ChatRoomMessageJSON{}

export interface PostChatRoomMessageUsecaseResponse{
    chatRoomMessage: PostChatRoomMessageJSON;
}


@autoInjectable()
@singleton()
export class PostChatRoomMessageUsecase implements UseCaseSpec<Promise<PostChatRoomMessageUsecaseResponse>>{

    constructor(
        @inject("ChatRoomMessageRepositorySpec") private chatRoomMessageRepo?: ChatRoomMessageRepositorySpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec
    ){}

    async execute(params: PostChatRoomMessageParams): Promise<PostChatRoomMessageUsecaseResponse> {
        const message:ChatRoomMessageModel = await this.chatRoomMessageRepo.postMessage(new ChatRoomMessageModel().fromJSON({...params}));
        return <PostChatRoomMessageUsecaseResponse>{
            chatRoomMessage: {...message.toJSON()}
        }
    }

}

export interface ChatRoomMessagesData{
    chatRoom: ChatRoomResponseJSON,
    messages: PostChatRoomMessageJSON[]
}

export interface GetAllChatRoomMessagesUsecaseResponse{
    chatRoomMessagesData: ChatRoomMessagesData;
}


export interface GetAllChatRoomMessagesUsecaseParams{
    chatRoomId: string;
    offset?: number;
    limit?: number;
}


@autoInjectable()
@singleton()
export class GetAllChatRoomMessagesUsecase implements UseCaseSpec<Promise<GetAllChatRoomMessagesUsecaseResponse>>{

    constructor(
        @inject("ChatRoomMessageRepositorySpec") private chatRoomMessageRepo?: ChatRoomMessageRepositorySpec,
        @inject("ChatRoomRepositorySpec") private chatRoomRepo?: ChatRoomRepositorySpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec
    ){}

    async execute(params: GetAllChatRoomMessagesUsecaseParams): Promise<GetAllChatRoomMessagesUsecaseResponse> {
        const { chatRoomId, offset=0, limit=50 } = params;
        const computedOffset = offset * limit;
        const chatRoomMEssages: ChatRoomMessageModel[] = await this.chatRoomMessageRepo.getChatRoomMessages(chatRoomId, 50, computedOffset);
        return <GetAllChatRoomMessagesUsecaseResponse>{
           chatRoomMessagesData:{
               chatRoom: (await new GetChatRoomByUserIdUseCase().execute({roomKey:chatRoomId})).chatRoom,
               messages: chatRoomMEssages.map((chatRoomMessage:ChatRoomMessageModel)=>chatRoomMessage.toJSON())
           }
        }
    }

}