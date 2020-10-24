import { env } from "custom-env";
import { Client } from "ts-postgres";
import { CHATROOM_TABLE_NAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, USER_TABLE_NAME } from  "./app/config/app.config";
import { PostgresDatabase } from "./app/data/datasources/postgres.database";


env("dev");

const USER_TABLE = USER_TABLE_NAME;

const CHATROOM_TABLE = CHATROOM_TABLE_NAME;

const db: PostgresDatabase = new PostgresDatabase();
db.setConnection(DB_HOST, Number(DB_PORT), DB_USERNAME, DB_NAME, DB_PASSWORD);

(async()=>{
    await db.connect();
    try{
        const response = await db.getConnector().query(
            `

            CREATE TABLE IF NOT EXISTS ${USER_TABLE_NAME}(
                id SERIAL PRIMARY KEY,
                lastname VARCHAR(100),
                firstname VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                dob DATE,
                passwordhash VARCHAR(500) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS ${CHATROOM_TABLE_NAME}(
                id SERIAL PRIMARY KEY, 
                room_key VARCHAR(100) NOT NULL, 
                user_id INTEGER NOT NULL REFERENCES bb(id) ON DELETE CASCADE ON UPDATE CASCADE, 
                UNIQUE(room_key, user_id)
            );

            ALTER TABLE ${CHATROOM_TABLE_NAME}
            ADD COLUMN IF NOT EXISTS created TIMESTAMP NOT NULL DEFAULT NOW();
            
        `);
        console.log("RESPONSE:");
        console.log(JSON.stringify(response));
    }catch(e){
        console.log("EXCEPTION:");
        console.log(e);
    }
})();