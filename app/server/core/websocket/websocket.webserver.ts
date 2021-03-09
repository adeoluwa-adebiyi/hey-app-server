import { Server, Socket } from "socket.io";
import "reflect-metadata";
import { UserAuthId } from "../../../domain/entities/user.model";
import "../../../appregistry.registry";
import { REDIS_HOST, REDIS_URL } from "../../../config/app.config";
import { TokenAuthSpec } from "../../contracts/tokenauthspec.interface";
import { container } from "tsyringe";
import { JWTLogin } from "./types/jwt-ws-login.interface";
import { SocketUserIdSessionMapSpec, UserIdSocketSessionMapSpec } from "./sessions/contracts/session.map.interface";
import { UserRepositorySpec } from "../../../domain/repositories/repository.interface";
import { WsAuthErrorMsg, WsClientSendMessagePayload, WsInternalErrorMsg, WsMsg, WsSuccessMsg } from "./types/ws-data-types.interface";
import { ChatRoomMessageJSON } from "../../../domain/entities/chat-room-message.model";
import { GetChatRoomByUserIdUseCase } from "../../../domain/usecases/create-chatroom.usecase";
import { UserIdSocketSessionMap } from "./sessions/userid-socket-session.map";
import { RoutableWebServerSpec } from "../../contracts/webserverspec.interface";
import { ExpressWebServer } from "../../express.webserver";
import { createServer } from "http";
import { PostChatRoomMessageParams, PostChatRoomMessageUsecase, PostChatRoomMessageUsecaseResponse } from "../../../domain/usecases/chat-room-message.usecase";
import { MessageBrokerSpec } from "../../brokers/contracts/broker.interface";
import { MB_NOTIFY_NEW_MESSAGE_EVENT } from "../../../domain/subscriptions/ssubscriptions";
import { Message } from "../../brokers/contracts/message.interface";
import { ChatRoomRepository } from "../../../data/repositories/postgresql/chatroom.repository";
import { ChatRoomModel } from "../../../domain/entities/chatroom.model";
import { NotifyNewMessage } from "../../../domain/types/notify-new-message.type";
import { ServerOptions } from "socket.io";


export const WS_CHATROOM_MESSAGE_NOTIFY_EVENT = "chatroom-message-notify";
export const WS_CHATROOM_MESSAGE_SEND_EVENT = "chatroom-message-send";



export const createWebSocketServer = (
    tokenAuthAlg: TokenAuthSpec,
    userRepo: UserRepositorySpec,
    sockToIdMap: SocketUserIdSessionMapSpec,
    idtoSockMap: UserIdSocketSessionMapSpec,
    webServerSpec: RoutableWebServerSpec,
    messageBroker: MessageBrokerSpec,
    chatRoomRepo: ChatRoomRepository
): WebSocketServerSpec => {

    const socketServer: Server = new Server(<Partial<ServerOptions>>{cors: {
        origin: "http://localhost:3000",
        credentials: true
      }});


    const registerUserSockMaps = async (userCred: UserAuthId, sockId: string): Promise<void> => {

        const sMap = sockToIdMap;
        const uMap = idtoSockMap;

        await sMap.set(sockId, userCred);

        const val = await uMap.get(userCred);

        await uMap.set(userCred, [...(val ? val : []), sockId]);
    }


    const deregisterUserSockMaps = async (userCred: UserAuthId, sockId: string) => {
        const sMap = sockToIdMap;
        const uMap = idtoSockMap;

        await sMap.set(sockId, null);
        const newList = (await uMap.get(userCred)).filter((item) => item === sockId ? null : sockId);

        return uMap.set(userCred, newList);
    }


    const notifyUserAuthError = async (socket: Socket) => {
        const errorMsg: WsAuthErrorMsg = {
            type: "error",
            messages: ["Authentication Failed"]
        }
        sendWsMessage(socket, "authenticate", errorMsg);
    }


    const notifyUserInternalServiceError = async (socket: Socket, messages = ["Internal Error"]) => {
        const interalErrorMsg: WsInternalErrorMsg = {
            type: "error",
            messages
        }
    }


    const sendWsMessage = async (socket: Socket, event: string, msg: WsMsg) => {
        socket.emit(event, JSON.stringify({ ...msg }));
    }


    const beginWebSocketService = (socket: Socket) => {

        socket.on(WS_CHATROOM_MESSAGE_SEND_EVENT, async (msg) => {
            try {
                const messagePayload: WsClientSendMessagePayload = JSON.parse(msg);
                const { chatRoomId, sender } = messagePayload;
                const chatRooms: ChatRoomModel[] = await chatRoomRepo.getUserChatRoomsByRoomKey(chatRoomId);
                const notificationRecipientIds: number[] =  chatRooms.map((chatRoom:ChatRoomModel)=>chatRoom.userId);
                new PostChatRoomMessageUsecase().execute(
                    <PostChatRoomMessageParams>{
                        ...messagePayload
                    }
                ).then((response: PostChatRoomMessageUsecaseResponse) => {

                    Promise.all([...notificationRecipientIds.map((id)=>messageBroker.publish(<Message>{
                        data: <NotifyNewMessage>{
                            destination: { id },
                            message: response.chatRoomMessage
                        }
                    }, MB_NOTIFY_NEW_MESSAGE_EVENT))])
                });
            } catch (e) {
                console.log(e);
                notifyUserInternalServiceError(socket);
            }
        });


    }


    socketServer.on("connection", (socket: Socket) => {


        socket.on("authenticate", (msg: string) => {
            const serialized: JWTLogin = JSON.parse(msg);
            const { jwt } = serialized;
            new Promise((resolve, reject) => {

                tokenAuthAlg.verify(jwt, (err: Error, verifiedToken: any) => {
                    if (err)
                        reject(err);
                    else
                        resolve(verifiedToken);
                });

            }).then((token: any) => {
                const userId = token.body.sub;
                registerUserSockMaps(<UserAuthId>{ id: userId }, socket.id).then(() => {

                    const successMsg = JSON.stringify(<WsSuccessMsg>{ type: "auth_sucess", data: "Authentication Successful" });

                    socket.emit("authenticated", successMsg);

                    beginWebSocketService(socket);


                }).catch(async (e) => {

                    await notifyUserAuthError(socket);

                });

            }).catch(async e => await notifyUserAuthError(socket));
        });

        socket.on("disconnect",async(_)=>{
            const userId = await sockToIdMap.get(socket.id);
            await deregisterUserSockMaps(await sockToIdMap.get(socket.id), socket.id);
        });

    });

    const http = createServer((<ExpressWebServer>webServerSpec).application);
    socketServer.listen(http);
    return socketServer;
}

export type WebSocketServerSpec = Server | WebSocket;