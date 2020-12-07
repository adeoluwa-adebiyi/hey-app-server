import { resolve } from "path";
import "reflect-metadata";
import { autoInjectable, inject } from "tsyringe";
import { SocketUserIdSessionMapSpec, UserIdSocketSessionMapSpec } from "../../server/core/websocket/sessions/contracts/session.map.interface";
import { WS_CHATROOM_MESSAGE_NOTIFY_EVENT, WebSocketServerSpec } from "../../server/core/websocket/websocket.webserver";
import { UserAuthId } from "../entities/user.model";
import { UserMessageNotifierSpec } from "./user-notifier.interface";
import { Server as WsServer } from "socket.io";


@autoInjectable()
export class WebSocketUserMessageNotifier implements UserMessageNotifierSpec {

    constructor(
        @inject("WebSocketServerSpec") private websocketServer?: WsServer,
        @inject("SocketUserIdSessionMapSpec") private socketUserIdSessionMap?: SocketUserIdSessionMapSpec,
        @inject("UserIdSocketSessionMapSpec") private userIdSocketSessionMap?: UserIdSocketSessionMapSpec
    ) { }

    notifyUser(user: UserAuthId, message: any): Promise<void> {
        return new Promise(async (resolve, reject) => {

            const connections: Array<string> = await this.userIdSocketSessionMap.get(user);

            await Promise.all(connections.map((connection) => {
                return new Promise((resolve, reject) => {
                    try {
                        this.websocketServer.to(connection).emit(WS_CHATROOM_MESSAGE_NOTIFY_EVENT,JSON.stringify(message));
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            }))
                .then(() => resolve())
                .catch((e) => reject(e));

        });
    }

}