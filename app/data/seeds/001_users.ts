import * as Knex from "knex";
import path from "path";
import fs from "fs";

export async function seed(knex: Knex): Promise<void> {

    const data = fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json"));
    if(!data){
        console.log("Seeding: 001_users failed");
        return;
    }else{
        const userList = JSON.parse(data.toString())["users"];

        console.log(userList);

        await knex.table("app-user").del();

        // Inserts seed entries
        return await knex.table("app-user").insert([
            ...userList.map((user:any)=>{return{...user}})
        ]);
    }
};
