import { exec, execSync } from "child_process";

export const beforeTestRoutine = ()=>{
    try{
        execSync("knex --knexfile knexfile.ts migrate:rollback");
    }catch(e){

    }

    try{
        execSync("knex --knexfile knexfile.ts migrate:up");
    }catch(e){

    }

    try{
        execSync("knex --knexfile knexfile.ts seed:run");
    }catch(e){

    }
}

export const afterTestRoutine = ()=>{
    beforeTestRoutine();
}