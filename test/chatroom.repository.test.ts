import "reflect-metadata";
import "../app/appregistry.registry";
import { container } from "tsyringe";
import { ChatRoomRepositorySpec, UserRepositorySpec } from "../app/data/repositories/repository.interface";
import { UserModel } from "../app/domain/entities/user.model";
import { USER_REGISTRATION_CREDENTIALS } from "./test.data";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { emptyDB, seedDB } from "../seed_db";
import { expect } from "chai";
import { ChatRoomModel } from "../app/domain/entities/chatroom.model";
import fs from "fs";
import path from "path";
import { BaseException } from "../app/common/exceptions/base.exception";
import { ObjectNotFoundException } from "../app/common/exceptions/object-not-found.exception";


const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");
const userRegistrationCredentials = USER_REGISTRATION_CREDENTIALS;
const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");


let users:Array<UserModel> = [];



describe("Tests ChatRoomRepository", ()=>{

    beforeEach((done)=>{
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        database.connect().then((v:any)=>{
             emptyDB(database).then((q:any)=>{
                 seedDB(database).then((res:any)=>{
                    done();
                })
            });
        })
    });

    it("Should get user chatrooms", (done)=>{

        setTimeout(()=>userRepository.deleteUser({...userRegistrationCredentials}).then((queryRes)=>{
            userRepository.createUser({...userRegistrationCredentials}).then((user)=>{

                chatRoomRepo.createChatRoom([user]).then((chatRooms)=>{
                    chatRoomRepo.getUserChatRooms(user).then((chatRooms)=>{
                        const chatRoom = chatRooms[0];
                        expect(chatRoom.id).to.be.a("number");
                        expect(chatRoom.roomKey).to.be.a("string");
                        expect(chatRoom.userId).to.equal(user.id);
                        done();
                    }).catch(e=>done(e));
                }).catch(e=>done(e));
            }).catch(e=>done(e));
        }).catch(e=>done(e)), 1000);
        
    })


    it("Should create valid chatrooms for users", (done)=>{

        setTimeout(()=>{
            const expectedChatRoomUserEmails = users.slice(0,2).map(user=>user.email);
            Promise.all([...expectedChatRoomUserEmails.map(email=>userRepository.getUserById({email}))])
                .then((values:UserModel[])=>{

                    chatRoomRepo.createChatRoom(values).then((chatRooms)=>{

                            expect(JSON.stringify(values.map(value=>value.id))).to.equal(
                                JSON.stringify(chatRooms.map(chatRoom=>chatRoom.userId)));
                            done();

                    }).
                    catch(e=>{
                        console.log(`ERROR: ${e}`)
                        done(e);
                    });

                }).catch(e=>{
                    console.log(e);
                    done(e);
                });    
            }, 1000);
    });


    it("Should delete user chatroom", (done)=>{
        setTimeout(()=>{
            userRepository.createUser({...userRegistrationCredentials})
            .then((user:UserModel)=>{
                chatRoomRepo.createChatRoom([user]).then((chatRooms:ChatRoomModel[])=>{
                    chatRoomRepo.deleteChatRoom(chatRooms[0].id).then((res:any)=>{
                        
                        chatRoomRepo.getChatRoom(chatRooms[0].id).then(()=>{
                            done(Error("Expected failure but test passed"));
                        }).catch((e: BaseException)=>{
                            expect(e).to.be.instanceOf(ObjectNotFoundException);
                            done();
                        })

                    }).catch((e:any)=>done(e));
                }).catch((e:any)=>{done(e)});
            })
            .catch((e:any)=>done(e));
        },1000);
    });

    it("Should retrieve user chatroom by ID", (done)=>{
        setTimeout(()=>{
            userRepository.createUser({...userRegistrationCredentials})
            .then((user:UserModel)=>{
                chatRoomRepo.createChatRoom([user]).then((chatRooms:ChatRoomModel[])=>{
                    chatRoomRepo.getChatRoom(chatRooms[0].id).then((chatRoom: ChatRoomModel)=>{
                        expect(chatRoom.id).to.be.a("number");
                        expect(chatRoom.roomKey).to.be.a("string");
                        expect(chatRoom.userId).to.equal(user.id);
                        done();
                    }).catch((e: BaseException)=>{
                        done(e);
                    })
                }).catch((e:any)=>{done(e)});
            })
            .catch((e:any)=>done(e));
        },1000);
    });
});