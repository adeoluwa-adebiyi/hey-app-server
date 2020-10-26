import "./appregistry.registry";
import spdy from "spdy";
import express, { Request, Response, Router } from "express";
import { MiddlewareConfigurable, RoutableWebServerSpec, WebServerSpec } from "./server/contracts/webserverspec.interface";
import { ExpressWebServer } from "./server/express.webserver";
import { container, container as di } from "tsyringe";
import {env} from "custom-env";
import process from "process";
import { PORT, HOST, DB_URI } from "./config/app.config"
import { AuthRouter, AUTH_USER_ROUTE_ENDPOINT } from "./routes/express/auth.route";
import { DatabaseSpec } from "./data/datasources/datasource.interface";
import bodyParser from "body-parser";
import { INDEX_ENDPOINT } from "./routes/urls";
import { IndexRouter } from "./routes/express/index.route";


const database: DatabaseSpec = container.resolve("DatabaseSpec");

database.connect().then(()=>{
  const httpServer: RoutableWebServerSpec = di.resolve("RoutableWebServerSpec");

  // Add routes
  httpServer.addRoute(AUTH_USER_ROUTE_ENDPOINT, AuthRouter);

  httpServer.addRoute(INDEX_ENDPOINT, IndexRouter);


  httpServer.listen(parseInt(PORT.toString()), HOST);
})

