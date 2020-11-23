import path from "path";
import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { UserModel } from "../app/domain/entities/user.model";
import { UserRepositorySpec, ChatRoomRepositorySpec } from "../app/domain/repositories/repository.interface";
import { emptyDB, seedDB } from "../seed_db";
import fs from "fs";
import { expect } from "chai";
import { ChatRoomModel } from "../app/domain/entities/chatroom.model";
import { GetUserChatRoomsUsecase, GetUserChatRoomsUsecaseResponse } from "../app/domain/usecases/get-user-chatrooms.usecase";


const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");

const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");

const database: DatabaseSpec = container.resolve("DatabaseSpec");

let users: UserModel[];


describe("Tests GetUserChatRoomsUsecase functionality", ()=>{

    beforeEach((done)=>{
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        database.connect().then(()=>{
            emptyDB(database).then(()=>{
                seedDB(database).then(()=>{
                    done();
                });
            });
        });
    });

    it("Should return list of valid user conversation chatrooms",(done)=>{
            setTimeout(()=>{
                Promise.all([...users.slice(0,2).map((_user: UserModel)=> userRepository.getUserById({email: _user.email}))])
                .then((_users:UserModel[])=>{

                    chatRoomRepo.createChatRoom(_users).then((chatRooms:ChatRoomModel[])=>{

                        chatRoomRepo.getUserChatRooms(_users[0]).then((_chatRooms:ChatRoomModel[])=>{

                            new GetUserChatRoomsUsecase().execute({userId: _users[0].id}).then((_res: GetUserChatRoomsUsecaseResponse)=>{     
                                expect(_res.chatRooms.map(roomm=>roomm.userId)).to.includes(_users[0].id);
                                done();
                            }).catch((e:any)=>{
                                done(e);
                            });

    
                        }).catch((e)=>{done(e)});

                    }).catch((e:any)=>{done(e)});
                })
                .catch((e:any)=>done(e));
            },1000);
    });

})