import "reflect-metadata";
import "./app/appregistry.registry";
import fs from "fs";
import path from "path";
import { CHATROOM_TABLE_NAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, USER_TABLE_NAME } from  "./app/config/app.config";
import { exit } from "process";
import { DatabaseSpec } from "./app/data/datasources/datasource.interface";
import { container } from "tsyringe";


// env("dev");

const TABLE_NAME = USER_TABLE_NAME
const CHAT_ROOM_TABLE_NAME = "chatroom"

const database: DatabaseSpec = container.resolve("DatabaseSpec");


export const seedDB = (async(db: DatabaseSpec) : Promise<any>=>{

    await db.connect();


    return Promise.all([
        db.getConnector().query(`DELETE FROM ${TABLE_NAME}`),
        db.getConnector().query(`DELETE FROM ${CHAT_ROOM_TABLE_NAME}`)
    ]).then((responses)=>{
        fs.readFile(path.resolve("./app/data/fixtures/users.fixture.json"),async (err, data)=>{
            if(err){
                console.log("Fixture export failed")
            }else{
                const json = JSON.parse(data.toString());
                // await db.getConnector().query("begin;")
                for(let data of json["users"]){
    
                    const { firstname, lastname, dob, email, passwordHash="djdjjd" } = data;
                    const values = [firstname,lastname,dob,email,passwordHash];
                    await db.getConnector().query(`INSERT into ${TABLE_NAME}(firstname, lastname, dob, email, passwordhash) VALUES( $1, $2, $3, $4, $5 )`, values)
                }
                // db.getConnector().query("commit;").then(async (onfulfilled:any)=>{
                //     exit(0);
                // })
            }
        });
    })

    

    

});


export const emptyDB = async(db: DatabaseSpec): Promise<any> =>{

    return db.connect().then((connMsg:any)=>{
        return Promise.all([db.getConnector().query(`DELETE FROM ${CHATROOM_TABLE_NAME}`)]).then((responses=>{
            return db.getConnector().query(`DELETE FROM ${TABLE_NAME}`)
        }))
    });
    
}

// (()=>{
//     seedDB(database);
// })();