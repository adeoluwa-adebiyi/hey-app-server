import Axios, { AxiosError } from "axios";
import { expect } from "chai";
import { Application, response } from "express";
import path from "path";
import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseSpec } from "../../../app/data/datasources/datasource.interface";
import { UserJSON, UserModel } from "../../../app/domain/entities/user.model";
import { UserRepositorySpec } from "../../../app/domain/repositories/repository.interface";
import { TokenAuthSpec } from "../../../app/server/contracts/tokenauthspec.interface";
import { RoutableWebServerSpec, WebServerSpec } from "../../../app/server/contracts/webserverspec.interface";
import { emptyDB, seedDB } from "../../../seed_db";
import { claims, USER_REGISTRATION_CREDENTIALS } from "../../test.data";
import fs from "fs";
import { ChatRoomRouter, CHATROOM_USER_ROUTE_ENDPOINT } from "../../../app/routes/express/chatroom.route";
import supertest from "supertest";
import { ExpressWebServer } from "../../../app/server/express.webserver";

const userCredentials = USER_REGISTRATION_CREDENTIALS;

const AUTH_USER_ROUTE = "/auth";

const webServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");

const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");

const database: DatabaseSpec = container.resolve("DatabaseSpec");

let userJWT: string; 

const address:string = "http://127.0.0.1";

const CHAT_ROOM_ENDPOINTS = {
    create: ()=>address+"/chatroom",
    delete: (roomKey:string)=>address+`/chatroom/roomKey/${roomKey}`,
    read: (roomKey:string)=>address+`/chatroom/roomKey/${roomKey}`
}

const tokenAuthAlgorithm:TokenAuthSpec = container.resolve("TokenAuthSpec");


const authHeaders:any = {
    headers: {
        "Authorization": `Bearer ${ tokenAuthAlgorithm.generateToken(claims) }`
    },
    validateStatus: ()=>true
};


let users: UserModel[];


describe("Tests ChatRoom Endpoint for functionality", ()=>{

    before(()=>{
        webServer.addRoute(CHATROOM_USER_ROUTE_ENDPOINT, ChatRoomRouter);
    })

    beforeEach((done)=>{
        webServer.listen(80, address.replace("http://",""));
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user:any)=>new UserModel().fromJSON(user));
        emptyDB(database).then(()=>{
            seedDB(database).then(()=>{
                done();
            })
        });
    });

    it("Should create & view new ChatRooms", (done)=>{
        setTimeout(()=>Promise.all([
            ...users.slice(0,2).map((user: UserModel)=>{
                return userRepository.getUserById({email: user.email})
            })
        ]).then((registeredUsers:UserModel[])=>{
            Axios({
                method: "POST",
                url: CHAT_ROOM_ENDPOINTS.create(),
                data:{
                    users:[...registeredUsers.map((usr:UserModel)=>usr.id)]
                },
                ...authHeaders
            }).then((response)=>{
                const { roomKey } = response.data.data.chatRoom;

                Axios({
                    method:"GET",
                    url: CHAT_ROOM_ENDPOINTS.read(roomKey),
                    ...authHeaders
                }).then((response)=>{

                    const { data } = response.data;

                    expect(data.chatRoom.chatRoom.roomKey).to.equal(roomKey);
                    expect(data.chatRoom.users.map((user:UserJSON)=>user.id)).contains(registeredUsers[0].id);
                    expect(data.chatRoom.users.map((user:UserJSON)=>user.id)).contains(registeredUsers[1].id);
                    done();
                }).catch((e:Error)=>{
                    done(e);
                });
            }).catch((e:Error)=>{
                done(e);
            });
        }).catch((e:Error)=>{
            done(e);
        }), 1000);
    });


    it("Should delete existing chatrooms", (done)=>{
          setTimeout(()=>
            Promise.all([
                ...users.slice(0,2).map((user: UserModel)=>{
                    return userRepository.getUserById({email: user.email})
                })]).then((registeredUsers: any)=>{
                    Axios({
                        method:"post",
                        url:CHAT_ROOM_ENDPOINTS.create().replace(address,""),
                        data:{
                            users: registeredUsers.map((user:UserModel)=>user.id)
                        },
                        ...authHeaders
                    }).then((chatRoom:any)=>{

        
                        Axios({
                            method: "DELETE",
                            url:CHAT_ROOM_ENDPOINTS.delete(chatRoom.data.data.chatRoom.roomKey),
                            ...authHeaders
                        }).then((_response:any)=>{

                            expect(_response.status).to.equal(200);
                            
                            Axios({
                                method:"get",
                                url: CHAT_ROOM_ENDPOINTS.read(chatRoom.data.data.chatRoom.roomKey),
                                ...authHeaders
                            }).then((res:any)=>{
                                expect(res.status).to.equal(404);
                                done();
                            }).catch((e:Error)=>done(e));
                            
                            
                        }).catch((e:Error)=>done(e));
                    
                    }).catch((e:Error)=>done(e));
                
                }).catch((e:Error)=>done(e))
        , 1000);

    })


    afterEach(()=>{
        webServer.close();
    })
    
});


