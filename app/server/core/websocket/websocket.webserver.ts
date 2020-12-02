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
import { WsAuthErrorMsg, WsMsg, WsSuccessMsg } from "./types/ws-data-types.interface";
import { ChatRoomMessageJSON } from "../../../domain/entities/chat-room-message.model";
import { GetChatRoomByUserIdUseCase } from "../../../domain/usecases/create-chatroom.usecase";
import { UserIdSocketSessionMap } from "./sessions/userid-socket-session.map";
import { RoutableWebServerSpec } from "../../contracts/webserverspec.interface";
import { ExpressWebServer } from "../../express.webserver";
import { createServer } from "http";


export const CHATROOM_MESSAGE_NOTIFY_EVENT = "chatroom-message-notify";



export const createWebSocketServer = (
    tokenAuthAlg: TokenAuthSpec,
    userRepo: UserRepositorySpec,
    sockToIdMap: SocketUserIdSessionMapSpec,
    idtoSockMap: UserIdSocketSessionMapSpec,
    webServerSpec: RoutableWebServerSpec,
): WebSocketServerSpec => {

    const socketServer: Server = new Server();


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


    const sendWsMessage = async (socket: Socket, event: string, msg: WsMsg) => {
        socket.emit(event, JSON.stringify({ ...msg }));
    }


    const beginWebSocketService = (socket: Socket) => {

        socket.on("hello", (msg: string) => {
            socket.emit(socket.id);
        });

        socket.on("chatroom-message", (msg) => {
            const serialized: ChatRoomMessageJSON = JSON.parse(msg);
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

            }).then(async (token: any) => {
                const userId = token.body.sub;
                registerUserSockMaps(<UserAuthId>{ id: userId }, socket.id).then((_) => {
                    const successMsg = JSON.stringify(<WsSuccessMsg>{ type: "auth_sucess", data: "Authentication Successful" });
                    socket.emit("authenticated", successMsg);
                    beginWebSocketService(socket);

                }).catch(async (e) => {

                    await notifyUserAuthError(socket);

                });

            }).catch(async e => await notifyUserAuthError(socket));
        });

    });
    const http = createServer((<ExpressWebServer>webServerSpec).application);
    socketServer.listen(http);
    return socketServer;
}

export type WebSocketServerSpec = Server | WebSocket;