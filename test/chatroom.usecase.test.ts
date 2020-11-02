import "reflect-metadata";
import { container } from "tsyringe";
import "../app/appregistry.registry";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../app/domain/repositories/repository.interface";
import { UserJSON, UserModel } from "../app/domain/entities/user.model";
import path from "path";
import { emptyDB, seedDB } from "../seed_db";
import fs from "fs";
import { CreateChatRoomUsecase, CreateChatRoomUsecaseResponse, DeleteChatRoomUsecase, GetChatRoomByRoomKeyUseCase, GetChatRoomByRoomKeyUseCaseResponse } from "../app/domain/usecases/create-chatroom.usecase";
import { expect } from "chai";
import { response } from "express";

const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");

const chatRoomRepository: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");

const database: DatabaseSpec = container.resolve("DatabaseSpec");

let users: UserModel[];

describe("Tests ChatRoomUsecase for functionality", ()=>{

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

    it("Should create valid ChatRooms", (done)=>{
        setTimeout(()=>Promise.all([
            ...users.slice(0,2).map((user: UserModel)=>userRepository.getUserById({email: user.email}))
        ]).then((registeredUsers: UserModel[])=>{
            new CreateChatRoomUsecase().execute({users:registeredUsers.map((user: UserModel)=>user.id)})
            .then((createChatRoomUsecaseResponse: CreateChatRoomUsecaseResponse)=>{
                // console.log("RESPONSE:");
                // console.log(createChatRoomUsecaseResponse);
                expect(createChatRoomUsecaseResponse.roomKey).to.be.a("string");
                expect(createChatRoomUsecaseResponse.users.map((user:UserModel)=>user.id)).contains(registeredUsers[0].id);
                expect(createChatRoomUsecaseResponse.users.map((user:UserModel)=>user.id)).contains(registeredUsers[1].id);
                done();
            }).catch((e:Error)=>{
                console.log(e);
                done(e);
            })
        }).catch((e:Error)=>{
            console.log(e);
            done(e);
        }),1000);
    })

    it("Should delete valid ChatRooms", (done)=>{
        setTimeout(()=>Promise.all([
            ...users.slice(0,2).map((user: UserModel)=>userRepository.getUserById({email: user.email}))
        ]).then((registeredUsers: UserModel[])=>{
            new CreateChatRoomUsecase().execute({users:registeredUsers.map((user: UserModel)=>user.id)})
            .then((createChatRoomUsecaseResponse: CreateChatRoomUsecaseResponse)=>{
                new DeleteChatRoomUsecase().execute({roomKey: createChatRoomUsecaseResponse.roomKey}).then(()=>{
                    done();
                }).catch((e:Error)=>{
                    done(e);
                })
            })
        }).catch((e:Error)=>{
            console.log(e);
            done(e);
        }),1000);
    })

    it("Should get valid ChatRoom by roomkey", (done)=>{
        setTimeout(()=>Promise.all([
            ...users.slice(0,2).map((user: UserModel)=>userRepository.getUserById({email: user.email}))
        ]).then((registeredUsers: UserModel[])=>{
            new CreateChatRoomUsecase().execute({users:registeredUsers.map((user: UserModel)=>user.id)})
            .then((createChatRoomUsecaseResponse: CreateChatRoomUsecaseResponse)=>{

                new GetChatRoomByRoomKeyUseCase().execute({roomKey: createChatRoomUsecaseResponse.roomKey})
                .then((response:GetChatRoomByRoomKeyUseCaseResponse)=>{
                    expect(response.chatRoom.chatRoom.roomKey).to.equal(createChatRoomUsecaseResponse.roomKey);
                    expect(response.chatRoom.users.map((user:UserJSON)=>user.id)).contains(registeredUsers[0].id);
                    expect(response.chatRoom.users.map((user:UserJSON)=>user.id)).contains(registeredUsers[1].id);
                    done();
                })
            }).catch((e:Error)=>{
                console.log(e);
                done(e);
            })
        }).catch((e:Error)=>{
            console.log(e);
            done(e);
        }),1000);
    })

})