import { expect } from "chai";
import path from "path";
import "reflect-metadata";
import { container } from "tsyringe";

import fs from "fs";
import { DatabaseSpec } from "../../../app/data/datasources/datasource.interface";
import { ChatRoomModel } from "../../../app/domain/entities/chatroom.model";
import { UserModel } from "../../../app/domain/entities/user.model";
import { ChatRoomMessageRepositorySpec, UserRepositorySpec, ChatRoomRepositorySpec } from "../../../app/domain/repositories/repository.interface";
import { PostChatRoomMessageUsecase, PostChatRoomMessageUsecaseResponse } from "../../../app/domain/usecases/chat-room-message.usecase";
import { emptyDB, seedDB } from "../../../seed_db";
import { MESSAGE_DATA } from "../../test.data";


const database: DatabaseSpec = container.resolve("DatabaseSpec");

const chatRoomMessageRepo: ChatRoomMessageRepositorySpec = container.resolve("ChatRoomMessageRepositorySpec");

const userRepo: UserRepositorySpec = container.resolve("UserRepositorySpec");

const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");

let loadedUsers: UserModel[];


describe("Tests ChatRoomMessageUsecases for functionality", ()=>{

    beforeEach(async ()=>{
        loadedUsers = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        await database.connect();
        emptyDB(database).then(async()=>{
            await seedDB(database);
        });
    });

    const { id, sender, message, messageType, referencedMessage, chatRoomId, time } = MESSAGE_DATA;

    it("Should correctly post ChatRoomMessages", (done)=>{
        setTimeout(()=>{

            Promise.all([
                userRepo.getUserById({email: loadedUsers[0].email}),
                userRepo.getUserById({email: loadedUsers[1].email}),
            ]).then((users: UserModel[])=>{

                chatRoomRepo.createChatRoom(users).then((chatRooms: ChatRoomModel[])=>{

                    userRepo.getUserById({email: loadedUsers[0].email}).then((user:UserModel)=>{

                        new PostChatRoomMessageUsecase().execute({...MESSAGE_DATA, referencedMessage:89, sender:user.id, chatRoomId: chatRooms[0].roomKey})
                        .then((messageResponse: PostChatRoomMessageUsecaseResponse)=>{
                            const { chatRoomMessage } = messageResponse;
                            const obj = chatRoomMessage;
                            console.log(obj);
                            expect(obj.id).to.be.a("number");
                            expect(obj.message).to.equal(message);
                            expect(obj.sender).to.equal(user.id);
                            expect(obj.messageType).to.equal(messageType);
                            expect(obj.referencedMessage).to.equal(89);
                            expect(obj.chatRoomId).to.equal(chatRooms[0].roomKey);
                            expect(new Date(obj.time).toLocaleDateString()).to.equal(new Date(time).toLocaleDateString());
                            done();
                        }
                        ).catch((e:Error)=>done(e));
        
                    }).catch((e:Error)=>{
                        done(e);
                    });
                })

            }).catch((e: Error)=>done(e));

        },1000)
    });


})