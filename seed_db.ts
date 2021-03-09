import "reflect-metadata";
import "./app/appregistry.registry";
import fs from "fs";
import path from "path";
import { CHATROOM_TABLE_NAME, CHAT_ROOM_MESSAGE_TABLE_NAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, USER_TABLE_NAME } from  "./app/config/app.config";
import { DatabaseSpec } from "./app/data/datasources/datasource.interface";
import { container } from "tsyringe";
import { TokenAuthSpec } from "./app/server/contracts/tokenauthspec.interface";
import { PasswordHasherSpec } from "./app/common/core/hashers/contract/hasher.interface";


const _USER_TABLE_NAME = USER_TABLE_NAME;
const _CHAT_ROOM_TABLE_NAME = "chatroom";
const _CHAT_ROOM_MESSAGE_TABLE_NAME = CHAT_ROOM_MESSAGE_TABLE_NAME;

const database: DatabaseSpec = container.resolve("DatabaseSpec");

const passwordHashAlg: PasswordHasherSpec = container.resolve("PasswordHasherSpec");


export const seedDB = (async(db: DatabaseSpec) : Promise<any>=>{

    await db.connect();


    return Promise.all([
        db.getConnector().query(`DELETE FROM ${_USER_TABLE_NAME}`),
        db.getConnector().query(`DELETE FROM ${_CHAT_ROOM_TABLE_NAME}`),
        db.getConnector().query(`DELETE FROM ${_CHAT_ROOM_MESSAGE_TABLE_NAME}`)
    ]).then((responses)=>{
        fs.readFile(path.resolve("./app/data/fixtures/users.fixture.json"),async (err, data)=>{
            if(err){
                console.log("Fixture export failed")
            }else{
                const json = JSON.parse(data.toString());
                for(let data of json["users"]){
                    const { firstname, lastname, dob, email, passwordHash=await passwordHashAlg.hashPassword(data.password), username, pic } = data;
                    const values = [firstname,lastname,dob,email,passwordHash, username, pic];
                    await db.getConnector().query(`INSERT into ${_USER_TABLE_NAME}(firstname, lastname, dob, email, passwordhash, username, pic) VALUES( $1, $2, $3, $4, $5, $6, $7 )`, values)

                }
            }
        });
    });

});


export const emptyDB = async(db: DatabaseSpec): Promise<any> =>{

    return db.connect().then((connMsg:any)=>{
        return Promise.all([
            db.getConnector().query(`DELETE FROM ${_CHAT_ROOM_MESSAGE_TABLE_NAME}`),
            db.getConnector().query(`DELETE FROM ${CHATROOM_TABLE_NAME}`),
            db.getConnector().query(`DELETE FROM ${_USER_TABLE_NAME}`)

        ]);
    });
    
}