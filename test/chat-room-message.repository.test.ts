import { before } from "mocha";
import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import "../app/appregistry.registry";
import { MESSAGE_DATA, USER_REGISTRATION_CREDENTIALS } from "./test.data";
import { emptyDB, seedDB } from "../seed_db";
import { ChatRoomMessageRepositorySpec, ChatRoomRepositorySpec, UserRepositorySpec } from "../app/domain/repositories/repository.interface";
import { ChatRoomMessageModel } from "../app/domain/entities/chat-room-message.model";
import { expect } from "chai";
import { ChatRoomRepository } from "../app/data/repositories/postgresql/chatroom.repository";
import { ChatRoomModel } from "../app/domain/entities/chatroom.model";
import { UserModel } from "../app/domain/entities/user.model";
import { ObjectNotFoundException } from "../app/common/exceptions/object-not-found.exception";


const database: DatabaseSpec = container.resolve("DatabaseSpec");

const chatRoomMessageRepo: ChatRoomMessageRepositorySpec = container.resolve("ChatRoomMessageRepositorySpec");

const userRepo: UserRepositorySpec = container.resolve("UserRepositorySpec");

const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");

describe("Tests ChatRoomMessageRepository functionality", ()=>{

    beforeEach(async ()=>{
        await database.connect();
        emptyDB(database).then(async()=>{
            await seedDB(database);
        });
    })

    const { id, sender, message, messageType, referencedMessage, chatRoomId, time } = MESSAGE_DATA;

    it("Should correctly post ChatRoomMessageModels", (done)=>{
        setTimeout(()=>
        userRepo.deleteUser({...USER_REGISTRATION_CREDENTIALS}).then(()=>{
            userRepo.createUser({...USER_REGISTRATION_CREDENTIALS}).then((user:UserModel)=>{
                chatRoomRepo.createChatRoom([new UserModel().fromJSON({...USER_REGISTRATION_CREDENTIALS, id:user.id})]).then((chatRoom: ChatRoomModel[])=>{
                    chatRoomMessageRepo.postMessage(new ChatRoomMessageModel()
                        .fromJSON({...MESSAGE_DATA, chatRoomId:chatRoom[0].roomKey, sender: chatRoom[0].userId}))
                        .then((chatRoomMessage:ChatRoomMessageModel)=>{
                            const obj:ChatRoomMessageModel = chatRoomMessage;
                            expect(obj.id).to.be.a("number");
                            expect(obj.message).to.equal(message);
                            expect(obj.sender).to.equal(chatRoom[0].userId);
                            expect(obj.messageType).to.equal(messageType);
                            expect(obj.referencedMessage).to.equal(referencedMessage);
                            expect(obj.chatRoomId).to.equal(chatRoom[0].roomKey);
                            expect(new Date(obj.time).toLocaleDateString()).to.equal(new Date(time).toLocaleDateString());
                            done();
                        }).catch((e:Error)=>{
                            done(e);
                        });
                    }).catch((e:Error)=>{
                        done(e);
                    })
            }).catch((e:Error)=>{
                done(e);
            })
        })
                    
        ,5000);
    })

    it("Should retrieve valid ChatRoomMessageModels", (done)=>{

        setTimeout(()=>{
            userRepo.deleteUser({...USER_REGISTRATION_CREDENTIALS}).then(()=>{
                userRepo.createUser({...USER_REGISTRATION_CREDENTIALS}).then((user:UserModel)=>{

                    chatRoomRepo.createChatRoom([new UserModel().fromJSON({...USER_REGISTRATION_CREDENTIALS, id:user.id})]).then((chatRoom: ChatRoomModel[])=>{

                        chatRoomMessageRepo.postMessage(new ChatRoomMessageModel().fromJSON({...MESSAGE_DATA, chatRoomId:chatRoom[0].roomKey, sender:chatRoom[0].userId})).then((chatRoomMessageRes:ChatRoomMessageModel)=>{

                            chatRoomMessageRepo.getChatRoomMessages(chatRoom[0].roomKey,50)
                            .then((chatRoomMessages:ChatRoomMessageModel[])=>{
                                const obj:ChatRoomMessageModel = chatRoomMessages[0];
                                expect(obj.id).to.be.a("number");
                                expect(obj.message).to.equal(message);
                                expect(obj.sender).to.equal(chatRoom[0].userId);
                                expect(obj.messageType).to.equal(messageType);
                                expect(obj.referencedMessage).to.equal(referencedMessage);
                                expect(obj.chatRoomId).to.equal(chatRoom[0].roomKey);
                                expect(new Date(obj.time).toLocaleDateString()).to.equal(new Date(time).toLocaleDateString());
                                done();
                            }).catch((e:Error)=>{
                                done(e);
                            });

                        }).catch((e:Error)=>{
                            done(e);
                        });
                    }).catch((e:Error)=>{
                        done(e);
                    });
                }).catch((e:Error)=>{
                    done(e);
                });

            }).catch((e:Error)=>{
                done(e);
            });
        },1000);

    })

    it("Should delete ChatRoomMessageModels corretly", (done)=>{
        setTimeout(()=>userRepo.deleteUser({...USER_REGISTRATION_CREDENTIALS}).then(()=>{
            userRepo.createUser({...USER_REGISTRATION_CREDENTIALS}).then((user:UserModel)=>{

                chatRoomRepo.createChatRoom([new UserModel().fromJSON({...USER_REGISTRATION_CREDENTIALS, id:user.id})]).then((chatRoom: ChatRoomModel[])=>{

                    Promise.all([
                        chatRoomMessageRepo.postMessage(new ChatRoomMessageModel().fromJSON({...MESSAGE_DATA, chatRoomId:chatRoom[0].roomKey, sender:chatRoom[0].userId})),
                        chatRoomMessageRepo.postMessage(new ChatRoomMessageModel().fromJSON({...MESSAGE_DATA, chatRoomId:chatRoom[0].roomKey, sender:chatRoom[0].userId})),
                    ]).then((chatRoomMessages:ChatRoomMessageModel[])=>{
                        const first = chatRoomMessages[0];
                        chatRoomMessageRepo.deleteChatRoomMessage(first.id)
                        .then((queryRes: any)=>{
                            chatRoomMessageRepo.getChatRoomMessage(first.id).then((messages:ChatRoomMessageModel)=>{
                                expect(messages).to.be.an("error");
                                done(Error("Test failed. Expected Error"));
                            }).catch((e:Error)=>{
                                if(e instanceof ObjectNotFoundException){
                                    done();
                                }else
                                done(Error("Did not throw ObjectDoesNotExistException"));
                            })
                        }).catch((e:Error)=>done(e));
        
                    }).catch((e:Error)=>done(e));;
                }).catch((e:Error)=>done(e));;
            }).catch((e:Error)=>done(e));;
        }),1000);
    })

})