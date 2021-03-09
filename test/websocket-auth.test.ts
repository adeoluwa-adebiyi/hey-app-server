import "reflect-metadata";
import { container } from "tsyringe";
import "../app/appregistry.registry";
import { UserMessageNotifierSpec } from "../app/domain/notifiers/user-notifier.interface";
import path, { resolve } from "path";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { UserModel } from "../app/domain/entities/user.model";
import { ChatRoomMessageRepositorySpec, UserRepositorySpec, ChatRoomRepositorySpec } from "../app/domain/repositories/repository.interface";
import { emptyDB, seedDB } from "../seed_db";
import fs from "fs";
import { WsMsg, WsSuccessMsg } from "../app/server/core/websocket/types/ws-data-types.interface";
import { ExpressWebServer } from "../app/server/express.webserver";
import { WS_CHATROOM_MESSAGE_NOTIFY_EVENT, createWebSocketServer, WebSocketServerSpec } from "../app/server/core/websocket/websocket.webserver";
import { createServer, Server } from "http";
import io from "socket.io-client";
import { TokenAuthSpec } from "../app/server/contracts/tokenauthspec.interface";
import { accessTokenExpiryDuration } from "../app/domain/usecases/authenticate-users.usecase";
import { JWTLogin } from "../app/server/core/websocket/types/jwt-ws-login.interface";
import Axios from "axios";
import { Server as WsServer } from "socket.io";
import { expect } from "chai";


const userMessageNotifier: UserMessageNotifierSpec = container.resolve<UserMessageNotifierSpec>("UserMessageNotifierSpec");

const database: DatabaseSpec = container.resolve("DatabaseSpec");

const chatRoomMessageRepo: ChatRoomMessageRepositorySpec = container.resolve("ChatRoomMessageRepositorySpec");

const userRepo: UserRepositorySpec = container.resolve("UserRepositorySpec");

const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");

let users: Array<UserModel> = [];

const server = container.resolve("RoutableWebServerSpec");

const tokenAuthAlg: TokenAuthSpec = container.resolve<TokenAuthSpec>("TokenAuthSpec");

const webSocketServer: WebSocketServerSpec = container.resolve("WebSocketServerSpec");

let appServer: Server;

describe("Tests WebsocketUserMessageNotifier for functionality", () => {

    before((done) => {
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user: any) => new UserModel().fromJSON(user));
        database.connect().then((v: any) => {
            emptyDB(database).then((q: any) => {
                seedDB(database).then((res: any) => {
                    appServer = createServer((<ExpressWebServer>server).application);
                    appServer.listen(80, "0.0.0.0");
                    (<WsServer>webSocketServer).listen(appServer);
                    done();
                })
            });
        })
    });

    it("Should send message via websocket to user", (done) => {

        setTimeout(() => {

            const data: any = {
                name: "Solomon Grundy"
            };

            new Promise(async (resolve, reject) => {

                const socket: SocketIOClient.Socket = io.connect(
                    "http://127.0.0.1:80",
                );

                socket.on("connect", async () => {
                    try {

                        const user: UserModel = await userRepo.getUserById({ email: users[0].email });
                        const jwt = tokenAuthAlg.generateToken({ sub: user.id, expiresAt: accessTokenExpiryDuration() });

                        socket.emit("authenticate", JSON.stringify(<JWTLogin>{ jwt: jwt }));
                        socket.on("authenticated", (msg: any) => {

                            const serialized: WsMsg = JSON.parse(msg);

                            if (serialized.type === "error")
                                reject(Error("Authorization failed"))

                            else {
                                resolve()
                            }

                        });
                        
                    } catch (e) {
                        reject(e);
                    }
                });

            }).then((serialized: WsMsg) => {
                done();
            }).catch(e => (done(e)));
        }, 5000);
    });


    after(() => {
        appServer.close();
    })

});