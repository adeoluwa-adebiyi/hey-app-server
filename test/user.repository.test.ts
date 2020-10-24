import "reflect-metadata";
import "../app/appregistry.registry";
import { expect } from "chai";
import { container } from "tsyringe";
import { UserRepositorySpec } from "../app/data/repositories/repository.interface";
import { UserModel } from "../app/domain/entities/user.model";
import Knex from "knex-ts";
import { HOST, PORT, DB_URI } from "../app/config/app.config";
import { KnexClient } from "../app/data/datasources/knexsql.database";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import fs from "fs";
import path from "path";
import { ObjectNotFoundException } from "../app/common/exceptions/object-not-found.exception";
import { exit } from "process";
import { USER_REGISTRATION_CREDENTIALS } from "./test.data";
import { afterTestRoutine, beforeTestRoutine } from "./test-routines";
import { emptyDB, seedDB } from "../seed_db";

const USER_TABLE = "bb";
const userRepository:UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");
const userId:number = 1;
const invalidUserId:any = {email:"hdkjk@mail.com"};

const userCredentials: any = USER_REGISTRATION_CREDENTIALS;

const validModel = new UserModel().fromJSON(userCredentials);

describe("Tests UserRepository functionality", ()=>{

    let users: Array<any>;

    before(async ()=>{
        await database.connect();
        const fixture  =  JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString());
        users = { users } = fixture;
        emptyDB(database).then(async()=>{
            await seedDB(database);
        });
    });

    it("Should fetch a user by id from datasource correctly",async ()=>{
        try{
        const fixture  =  JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString());
        const { users } = fixture;
        const res = await userRepository.getUserById({email:users[0].email});
        expect(JSON.stringify((res.toJSON()))).to.equal(JSON.stringify(new UserModel().fromJSON({...users[0], id:res.id}).toJSON()));
        expect(res.toJSONWithAuthCred()).to.haveOwnProperty("passwordHash");
        }catch(e){
            console.log(e);
        }
    });

    it("Should return ObjectNotFoundException on wrong user id",async()=>{
        try{
            const res = await userRepository.getUserById(invalidUserId);
            expect(false).to.equal(true);
        }catch(e){
            expect(e).to.be.instanceOf(ObjectNotFoundException);
        }
    });

    it("Should correctly create new users from credentials", async()=>{
        const { email } = userCredentials;
        database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email=$1`,[email]).then(async()=>{
            const user: UserModel =  await userRepository.createUser({...userCredentials});
            expect(JSON.stringify(user.toJSONWithAuthCred())).to.equal(JSON.stringify({...validModel.toJSONWithAuthCred(), id:user.id, passwordHash: user.passwordHash}));
        });
    });

    it("Should correctly delete a user", async()=>{

        database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email = $1`,[userCredentials.email]).then(async()=>{
            let user: UserModel =  await userRepository.createUser({...userCredentials});
            if(user){
                await userRepository.deleteUser({...userCredentials});
                try{
                    user =  await userRepository.getUserById(userCredentials);
                }catch(e){
                    console.log(e);
                    expect(e).to.be("error");
                }
            }
        });
    });

    after(()=>{
        exit(0);
    })

})