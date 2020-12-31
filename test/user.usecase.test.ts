import "reflect-metadata";
import path from "path";
import { container } from "tsyringe";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { UserRepositorySpec } from "../app/domain/repositories/repository.interface";
import { emptyDB, seedDB } from "../seed_db";
import { USER_REGISTRATION_CREDENTIALS } from "./test.data";
import fs from "fs";
import { UserJSON, UserModel, UserProfileJSON } from "../app/domain/entities/user.model";
import { expect } from "chai";
import { GetUserProfileUsecase, GetUserProfileUsecaseResponse } from "../app/domain/usecases/user.usecase";

const userRepository:UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");
let users:any[];

describe("Test User usecases for functionality",()=>{

    beforeEach((done)=>{
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        database.connect().then(()=>{
            emptyDB(database).then(()=>{
                seedDB(database).then(()=>{
                    done();
                });
            });
        })
    });

    it("GetUserProfile usecase should send valid user profile", (done)=>{
        setTimeout(async()=>{
            new GetUserProfileUsecase().execute({id: (await userRepository.getUserById({email: users[0].email})).id}).then((response: GetUserProfileUsecaseResponse)=>{
            const userProfile: UserProfileJSON = response.data;
            expect(JSON.stringify({...userProfile, id:null})).to.equal(JSON.stringify({...new UserModel().fromJSON(users[0]).toJSON(),id:null}));
            done();
        }).catch((e:Error)=>{
            done(e);
        })
    },5000);
    })
})