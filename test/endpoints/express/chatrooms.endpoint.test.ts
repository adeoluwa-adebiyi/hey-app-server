import { describe } from "mocha";
import path from "path";
import { container } from "tsyringe";
import { DatabaseSpec } from "../../../app/data/datasources/datasource.interface";
import { UserModel } from "../../../app/domain/entities/user.model";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../../../app/domain/repositories/repository.interface";
import { RoutableWebServerSpec } from "../../../app/server/contracts/webserverspec.interface";
import { emptyDB, seedDB } from "../../../seed_db";
import { claims, USER_REGISTRATION_CREDENTIALS } from "../../test.data";
import fs from "fs";
import supertest, { Response } from "supertest";
import { ExpressWebServer } from "../../../app/server/express.webserver";
import { TokenAuthSpec } from "../../../app/server/contracts/tokenauthspec.interface";
import { response } from "express";
import { ChatRoomModel } from "../../../app/domain/entities/chatroom.model";
import { expect } from "chai";
import { GetChatRoomByUserIdUseCase } from "../../../app/domain/usecases/create-chatroom.usecase";
import { GetUserChatRoomsUsecase, GetUserChatRoomsUsecaseResponse } from "../../../app/domain/usecases/get-user-chatrooms.usecase";


const userCredentials = USER_REGISTRATION_CREDENTIALS;

const AUTH_USER_ROUTE = "/auth";

const webServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");

const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");

const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");


const database: DatabaseSpec = container.resolve("DatabaseSpec");

let userJWT: string; 

const address:string = "http://127.0.0.1";

const CHAT_ROOM_ENDPOINTS = {
    list: ()=>"/chatrooms",
}

let users: UserModel[] = null;


const tokenAuthAlgorithm:TokenAuthSpec = container.resolve("TokenAuthSpec");

let CLAIMS:any = claims;

const authHeaders= (sub:number) => {
    CLAIMS["sub"] = sub;

    return {
        headers: {
            "Authorization": `Bearer ${ tokenAuthAlgorithm.generateToken(CLAIMS) }`
        },
    }
};



describe("Test ChatRooms endpoint for functionality", ()=>{

    beforeEach((done)=>{
        // webServer.listen(80, address.replace("http://",""));
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        emptyDB(database).then(()=>{
            seedDB(database).then(()=>{
                done();
            })
        });
    });

    it("/chatrooms endpoint should return GetUserChatRoomData",(done)=>{

        setTimeout(()=>{
            Promise.all([...users.slice(0,2).map((_user: UserModel)=> userRepository.getUserById({email: _user.email}))])
                .then((_users:UserModel[])=>{

            chatRoomRepo.createChatRoom(_users).then((chatRooms:ChatRoomModel[])=>{
                supertest((<ExpressWebServer>webServer).application)
                    .get(CHAT_ROOM_ENDPOINTS.list())
                    .set("Authorization", authHeaders(_users[0].id)["headers"]["Authorization"])
                    .then((response:Response)=>{
                        new GetUserChatRoomsUsecase().execute({userId: _users[0].id}).then((_response: GetUserChatRoomsUsecaseResponse)=>{
                            expect(JSON.stringify(response.body)).to.equal(JSON.stringify(_response));
                            done()
                        })
                        .catch((e)=>done(e));
                    })
                    .catch((e:Error)=>done(e));
            }).catch((e:Error)=>done(e));

        }).catch((e:Error)=>done(e));
        }, 1000);

        
    });

})