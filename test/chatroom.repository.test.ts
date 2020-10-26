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


const chatRoomRepo: ChatRoomRepositorySpec = container.resolve("ChatRoomRepositorySpec");
const userRegistrationCredentials = USER_REGISTRATION_CREDENTIALS;
const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");


let users:Array<UserModel> = [];



describe("Tests ChatRoomRepository", ()=>{

    before((done)=>{
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        database.connect().then((v:any)=>{
            console.log("V:"+v);
             emptyDB(database).then((q:any)=>{
                console.log("Q:"+q);
                 seedDB(database).then((res:any)=>{
                    console.log("DONE");
                    done();
                })
            });
        })
    });

    // it("Should get user chatrooms", (done)=>{
    //     userRepository.deleteUser({...userRegistrationCredentials}).then((queryRes)=>{
    //         userRepository.createUser({...userRegistrationCredentials}).then((user)=>{
    //             const userModel:UserModel =  new UserModel().fromJSON({...userRegistrationCredentials});
    //             chatRoomRepo.getUserChatRooms(userModel).then((chatRooms)=>{
    //                 const chatRoom = chatRooms[0];
    //                 expect(chatRoom.id).to.be.a("number");
    //                 expect(chatRoom.roomKey).to.be.a("string");
    //                 expect(chatRoom.userId).to.equal(user.id);
    //                 done();
    //             }).catch(e=>done(e));
    //         }).catch(e=>done(e));
    //     }).catch(e=>done(e));
    // })


    it("Should create valid chatrooms for users", (done)=>{

        console.log("WAITING FOR DB SEED");
        setTimeout(()=>{
                const expectedChatRoomUserEmails = users.slice(0,2).map(user=>user.email);
                Promise.all([...expectedChatRoomUserEmails.map(email=>userRepository.getUserById({email}))])
                .then((values:UserModel[])=>{

                    console.log(`USERS: ${JSON.stringify(values)}`);
                    chatRoomRepo.createChatRoom(values).then((chatRooms)=>{

                        console.log("CHATROOMS:'");
                        console.log(chatRooms);
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
            }, 10000);
    });

});