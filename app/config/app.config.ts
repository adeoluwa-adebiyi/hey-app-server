import { env } from "custom-env";


const mode = "dev";

env(mode);

export const { 
    PORT = 80, 
    HOST = "0.0.0.0", 
    DB_URI, 
    SECRET, 
    DB_HOST, 
    DB_PASSWORD, 
    DB_USERNAME, 
    DB_PORT = 5432, 
    DB_NAME, 
    
    REDIS_HOST = "localhost", 
    REDIS_PORT = 6379, 
    REDIS_DB = "1", 
    REDIS_USERNAME = "", 
    REDIS_PASSWORD = "", 
    REDIS_URL = "",

    WS_REDIS_HOST = "localhost", 
    WS_REDIS_PORT = 6379, 
    WS_REDIS_DB = "1", 
    WS_REDIS_USERNAME = "", 
    WS_REDIS_PASSWORD = "", 
    WS_REDIS_URL = "",

    KAFKA_SSL="",
    KAFKA_CLIENT_ID = "",
    KAFKA_BROKERS="",
    KAFKA_USERNAME="",
    KAFKA_PASSWORD=""
} = process.env;

export const USER_TABLE_NAME = "bb";

export const CHATROOM_TABLE_NAME = "chatroom";

export const CHAT_ROOM_MESSAGE_TABLE_NAME = "chatroom_message";

export const ACCESS_JWT_COOKIE_NAME = "access_jwt";

export const REFRESH_JWT_COOKIE_NAME = "refresh_jwt"

export const JWT_COOKIE_EXPIRY = 90000000;