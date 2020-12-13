import "reflect-metadata";
import "./appregistry.registry";
import { RoutableWebServerSpec } from "./server/contracts/webserverspec.interface";
import { container, container as di } from "tsyringe";
import { PORT, HOST, DB_URI } from "./config/app.config"
import { AuthRouter, AUTH_USER_ROUTE_ENDPOINT } from "./routes/express/auth.route";
import { DatabaseSpec } from "./data/datasources/datasource.interface";
import { CHATROOM_MESSAGES_ENDPOINT, INDEX_ENDPOINT } from "./routes/urls";
import { IndexRouter } from "./routes/express/index.route";
import { ChatRoomRouter, CHATROOM_USER_ROUTE_ENDPOINT } from "./routes/express/chatroom.route";
import { ChatRoomsRouter, CHATROOMS_ENDPOINT } from "./routes/express/chatrooms.route";
import { ChatRoomMessagesRouter } from "./routes/express/chatroom-messages.route";
import { createServer, Server } from "http";
import { ExpressWebServer } from "./server/express.webserver";
import { Server as WsServer } from "socket.io";
import { WebSocketServerSpec } from "./server/core/websocket/websocket.webserver";
import { MessageBrokerSubscriptionsManagerSpec } from "./domain/subscriptions/manager.interface";
import { RedisChatMessageNotifierMessageBrokerSubscription } from "./domain/subscriptions/ssubscriptions";


const database: DatabaseSpec = container.resolve("DatabaseSpec");

database.connect().then(()=>{
  
  const httpServer: RoutableWebServerSpec = di.resolve("RoutableWebServerSpec");

  // Add routes
  httpServer.addRoute(AUTH_USER_ROUTE_ENDPOINT, AuthRouter);

  httpServer.addRoute(INDEX_ENDPOINT, IndexRouter);

  httpServer.addRoute(CHATROOM_USER_ROUTE_ENDPOINT, ChatRoomRouter);

  httpServer.addRoute(CHATROOMS_ENDPOINT, ChatRoomsRouter);

  httpServer.addRoute(CHATROOM_MESSAGES_ENDPOINT, ChatRoomMessagesRouter);

  const server: Server = createServer((<ExpressWebServer>httpServer).application);

  const subscriptionManager: MessageBrokerSubscriptionsManagerSpec = container.resolve("MessageBrokerSubscriptionsManagerSpec");

  subscriptionManager.registerSubscriptions([
      new RedisChatMessageNotifierMessageBrokerSubscription()
  ]);

  (<WsServer>container.resolve<WebSocketServerSpec>("WebSocketServerSpec")).listen(server);

  server.listen(parseInt(PORT.toString()), HOST);

})

