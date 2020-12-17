import "reflect-metadata";
import { container } from "tsyringe";
import { AuthenticationSpec } from "./server/contracts/authenticationspec.interface";
import { TokenAuthSpec } from "./server/contracts/tokenauthspec.interface";
import { MiddlewareConfigurable, RoutableWebServerSpec } from "./server/contracts/webserverspec.interface";
import { JWTTokenAuthAlgorithm } from "./server/core/jwt-token.token-auth";
import { JWTAuthentication } from "./server/authentication/jwt.authication";

import { ExpressWebServer } from "./server/express.webserver";
import express from "express";
import { Argon2PasswordHasher } from "./common/core/hashers/argon2.passwordhasher";
import { PasswordHasherSpec } from "./common/core/hashers/contract/hasher.interface";
import { Cache, DatabaseSpec, WsSessionCache } from "./data/datasources/datasource.interface";
import { PostgresDatabase } from "./data/datasources/postgres.database";
import { PgSQLUserRepository } from "./data/repositories/postgresql/user.repository";
import bodyParser from "body-parser";
import { ChatRoomRepository } from "./data/repositories/postgresql/chatroom.repository";
import "./common/utils/console-log-disable";
import { UserRepositorySpec, ChatRoomRepositorySpec, ChatRoomMessageRepositorySpec } from "./domain/repositories/repository.interface";
import { ChatRoomMessageRepository } from "./data/repositories/postgresql/chat-room-message.repository";
import { SocketUserIdSessionMapSpec, UserIdSocketSessionMapSpec } from "./server/core/websocket/sessions/contracts/session.map.interface";
import {
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_USERNAME,
    REDIS_DB,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    REDIS_URL,
    REDIS_USERNAME,

    SECRET,

    WS_REDIS_DB,
    WS_REDIS_HOST,
    WS_REDIS_PASSWORD,
    WS_REDIS_PORT,
    WS_REDIS_URL,
    WS_REDIS_USERNAME,
    KAFKA_BROKERS,
    KAFKA_CLIENT_ID,
    KAFKA_PASSWORD,
    KAFKA_USERNAME,
    KAFKA_SSL
} from "../app/config/app.config";
import { createClient, ClientOpts } from "redis";
import { RedisCache } from "./data/datasources/redis.cache";
import { SocketUserIdSessionMap } from "./server/core/websocket/sessions/socket-userid-session.map";
import { UserIdSocketSessionMap } from "./server/core/websocket/sessions/userid-socket-session.map";
import { UserMessageNotifierSpec } from "./domain/notifiers/user-notifier.interface";
import { WebSocketUserMessageNotifier } from "./domain/notifiers/websocket-user-message.notifier";
import { createWebSocketServer, WebSocketServerSpec } from "./server/core/websocket/websocket.webserver";
import { Kafka, KafkaConfig } from "kafkajs"
import { KafkaMessageBrokerSpec, MessageBrokerSpec } from "./server/brokers/contracts/broker.interface";
import { KafkaJSMessageBroker } from "./server/brokers/kafkajs.broker";
import { MessageBrokerSubscriptionsManagerSpec } from "./domain/subscriptions/manager.interface";
import { KafkaSubscriptionManager } from "./domain/subscriptions/kafkajs-subscription.manager";
import { KChatMessageNotifierMessageBrokerSubscription } from "./domain/subscriptions/ssubscriptions";
import { RedisMessageBroker } from "./server/brokers/redis.broker";
import { RedisSubscriptionsManager } from "./domain/subscriptions/redis-subscription.manager";
import cors from "cors";


const APP_SECRET = SECRET;

const EXEMPTED_ROUTES: Array<string> = [
    "/auth",
    "/",
    "/register",
]

const DATABASE = new PostgresDatabase();

const REDIS_CACHE = new RedisCache(createClient(<ClientOpts>{
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    db: 0,
    port: REDIS_PORT,
    url: REDIS_URL
}),
createClient(<ClientOpts>{
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    db: 0,
    port: REDIS_PORT,
    url: REDIS_URL
}),
createClient(<ClientOpts>{
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    db: 0,
    port: REDIS_PORT,
    url: REDIS_URL
})
);

const kafka = new Kafka(<KafkaConfig>{
    clientId: KAFKA_CLIENT_ID,
    brokers: KAFKA_BROKERS.split(","),
    ssl: true,
    sasl: {
        mechanism: "scram-sha-256",
        username: KAFKA_USERNAME,
        password: KAFKA_PASSWORD
    },
});


DATABASE.setConnection(DB_HOST, Number(DB_PORT), DB_USERNAME, DB_NAME, DB_PASSWORD);


container.register<DatabaseSpec>("DatabaseSpec", { useValue: DATABASE });

container.register<UserRepositorySpec>("UserRepositorySpec", { useClass: PgSQLUserRepository });

container.register<ChatRoomRepositorySpec>("ChatRoomRepositorySpec", { useClass: ChatRoomRepository });

container.register<ChatRoomMessageRepositorySpec>("ChatRoomMessageRepositorySpec", { useClass: ChatRoomMessageRepository });

container.register<TokenAuthSpec>("TokenAuthSpec", { useValue: new JWTTokenAuthAlgorithm(APP_SECRET) });

container.register<AuthenticationSpec<express.RequestHandler>>("AuthenticationSpec<<express.RequestHandler>>", { useClass: JWTAuthentication });

container.register<PasswordHasherSpec>("PasswordHasherSpec", { useValue: new Argon2PasswordHasher() });

// container.register<Cache>("Cache", {useValue: REDIS_CACHE});

container.register<WsSessionCache>("WsSessionCache", { useValue: REDIS_CACHE });

container.register<UserIdSocketSessionMapSpec>("UserIdSocketSessionMapSpec", { useValue: new UserIdSocketSessionMap() });

container.register<SocketUserIdSessionMapSpec>("SocketUserIdSessionMapSpec", { useValue: new SocketUserIdSessionMap() });

//Server & Routes

const webServer: ExpressWebServer = new ExpressWebServer(container.resolve("AuthenticationSpec<<express.RequestHandler>>"), EXEMPTED_ROUTES);

(<MiddlewareConfigurable>webServer).addMiddleware(bodyParser.json());
(<MiddlewareConfigurable>webServer).addMiddleware(cors({
    origin: "*"
}));


container.register<RoutableWebServerSpec>("RoutableWebServerSpec", { useValue: webServer });

const broker: MessageBrokerSpec =  new RedisMessageBroker(REDIS_CACHE);

container.register<MessageBrokerSpec>("MessageBrokerSpec", { useValue:  broker});

container.register<MessageBrokerSubscriptionsManagerSpec>("MessageBrokerSubscriptionsManagerSpec", { useValue: new RedisSubscriptionsManager(REDIS_CACHE) });

const webSocketServer = createWebSocketServer(
    container.resolve<TokenAuthSpec>("TokenAuthSpec"),
    container.resolve<UserRepositorySpec>("UserRepositorySpec"),
    container.resolve<SocketUserIdSessionMapSpec>("SocketUserIdSessionMapSpec"),
    container.resolve<UserIdSocketSessionMapSpec>("UserIdSocketSessionMapSpec"),
    container.resolve<RoutableWebServerSpec>("RoutableWebServerSpec"),
    container.resolve<MessageBrokerSpec>("MessageBrokerSpec"),
    container.resolve<ChatRoomRepositorySpec>("ChatRoomRepositorySpec")
);

container.register<WebSocketServerSpec>("WebSocketServerSpec", {
    useValue: webSocketServer
});

container.register<RedisCache>("RedisCache", {
    useValue: REDIS_CACHE
});

container.register<UserMessageNotifierSpec>("UserMessageNotifierSpec", { useValue: new WebSocketUserMessageNotifier() });
