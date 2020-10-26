import { env } from "custom-env";


const mode = "dev";

env(mode);

export const {PORT=80, HOST="0.0.0.0", DB_URI, SECRET, DB_HOST, DB_PASSWORD, DB_USERNAME, DB_PORT=5432, DB_NAME } = process.env;

export const USER_TABLE_NAME = "bb";
export const CHATROOM_TABLE_NAME = "chatroom";