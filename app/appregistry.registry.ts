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
import { ChatRoomRepositorySpec, UserRepositorySpec } from "./data/repositories/repository.interface";
import { DatabaseSpec } from "./data/datasources/datasource.interface";
import { SECRET, DB_HOST, DB_PORT, DB_USERNAME, DB_NAME, DB_PASSWORD } from "./config/app.config"
import { PostgresDatabase } from "./data/datasources/postgres.database";
import { PgSQLUserRepository } from "./data/repositories/postgresql/user.repository";
import bodyParser from "body-parser";
import { ChatRoomRepository } from "./data/repositories/postgresql/chatroom.repository";
import "./common/utils/console-log-disable";

const APP_SECRET = SECRET;

const EXEMPTED_ROUTES: Array<string> = [
    "/auth",
    "/",
    "/register"
] 

const DATABASE = new PostgresDatabase();

DATABASE.setConnection(DB_HOST, Number(DB_PORT), DB_USERNAME, DB_NAME, DB_PASSWORD);


container.register<DatabaseSpec>("DatabaseSpec", { useValue: DATABASE });

container.register<UserRepositorySpec>("UserRepositorySpec", { useClass: PgSQLUserRepository });

container.register<ChatRoomRepositorySpec>("ChatRoomRepositorySpec", { useClass: ChatRoomRepository });

container.register<TokenAuthSpec>("TokenAuthSpec", {useValue: new JWTTokenAuthAlgorithm(APP_SECRET)});

container.register<AuthenticationSpec<express.RequestHandler>>("AuthenticationSpec<<express.RequestHandler>>", { useClass: JWTAuthentication });

container.register<PasswordHasherSpec>("PasswordHasherSpec", { useValue: new Argon2PasswordHasher() });

const httpServer: ExpressWebServer = new ExpressWebServer(container.resolve("AuthenticationSpec<<express.RequestHandler>>"), EXEMPTED_ROUTES);

(<MiddlewareConfigurable>httpServer).addMiddleware(bodyParser.json());

container.register<RoutableWebServerSpec>("RoutableWebServerSpec", { useValue: httpServer });
