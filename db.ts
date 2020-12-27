import { env } from "custom-env";
import { exit } from "process";
import { Client } from "ts-postgres";
import { CHATROOM_TABLE_NAME, CHAT_ROOM_MESSAGE_TABLE_NAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, USER_TABLE_NAME } from  "./app/config/app.config";
import { PostgresDatabase } from "./app/data/datasources/postgres.database";


env("dev");

const USER_TABLE = USER_TABLE_NAME;

const CHATROOM_TABLE = CHATROOM_TABLE_NAME;

const db: PostgresDatabase = new PostgresDatabase();

db.setConnection(DB_HOST, Number(DB_PORT), DB_USERNAME, DB_NAME, DB_PASSWORD);

(async()=>{
    await db.connect();
    db.getConnector().query(`DROP TABLE IF EXISTS ${CHAT_ROOM_MESSAGE_TABLE_NAME}`).then(()=>{
    db.getConnector().query(`DROP TABLE IF EXISTS ${CHATROOM_TABLE_NAME}`).then(()=>{
        return db.getConnector().query(`DROP TABLE IF EXISTS ${USER_TABLE_NAME}`);
    }).then(async()=>{
        try{
            const response = await db.getConnector().query(
                `
                CREATE TABLE IF NOT EXISTS ${USER_TABLE_NAME}(
                    id SERIAL PRIMARY KEY,
                    lastname VARCHAR(100),
                    firstname VARCHAR(100),
                    email VARCHAR(100) UNIQUE NOT NULL,
                    dob DATE,
                    passwordhash VARCHAR(500) NOT NULL,
                    username VARCHAR(100),
                    pic VARCHAR(100)
                );
    
                CREATE TABLE IF NOT EXISTS ${CHATROOM_TABLE_NAME}(
                    id SERIAL PRIMARY KEY, 
                    room_key VARCHAR(100) NOT NULL, 
                    user_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES ${USER_TABLE_NAME}(id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED,
                    UNIQUE(room_key, user_id)
                );

                CREATE TABLE IF NOT EXISTS ${CHAT_ROOM_MESSAGE_TABLE_NAME}(
                    id SERIAL PRIMARY KEY,
                    chatroom_id VARCHAR(100),
                    message TEXT,
                    sender_id INTEGER,
                    FOREIGN KEY (sender_id) REFERENCES ${USER_TABLE_NAME}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    message_type VARCHAR(20),
                    referenced_message INTEGER
                );
    
                ALTER TABLE ${CHATROOM_TABLE_NAME}
                ADD COLUMN IF NOT EXISTS created TIMESTAMP NOT NULL DEFAULT NOW();
                
                ALTER TABLE ${USER_TABLE_NAME}
                ADD COLUMN IF NOT EXISTS pic TEXT;


                ALTER TABLE ${CHAT_ROOM_MESSAGE_TABLE_NAME}
                ADD COLUMN IF NOT EXISTS created TIMESTAMPTZ DEFAULT NOW();
            `);
            console.log("RESPONSE:");
            console.log(JSON.stringify(response));
            db.getConnector().done(true);
        }catch(e){
            console.log("EXCEPTION:");
            console.log(e);
        }
    })

    });
    
})();

//"                FOREIGN KEY (user_id) REFERENCES bb(id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED,"