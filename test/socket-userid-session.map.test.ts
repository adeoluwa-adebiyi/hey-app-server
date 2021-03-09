import { expect, assert } from "chai";
import "reflect-metadata";
import { container } from "tsyringe";
import "../app/appregistry.registry";
import { UserAuthId } from "../app/domain/entities/user.model";
import { SocketUserIdSessionMapSpec } from "../app/server/core/websocket/sessions/contracts/session.map.interface";

const suMap:SocketUserIdSessionMapSpec = container.resolve("SocketUserIdSessionMapSpec");

describe("Tests SocketUserIdSessionMap for functionality", () => {

    it("Should correctly set key-value pairs", (done) => {
        const SOCK_KEY = "sock#54745";
        const USER_ID = {id:78};
        suMap.set(SOCK_KEY, USER_ID).then((_)=>{
            suMap.get(SOCK_KEY).then((val:UserAuthId)=>{
                expect(JSON.stringify(val)).to.equal(JSON.stringify(USER_ID));
                done();
            }).catch(e=>done(e));
        }).catch((e:Error)=>done(e));
    });

    it("Should correctly reset key-value pairs", (done) => {
        const SOCK_KEY = "sock#54745";
        const USER_ID = {id:78};
        suMap.set(SOCK_KEY, USER_ID).then(_=>{
            suMap.reset().then(_=>{
                suMap.get(SOCK_KEY).then((val:UserAuthId)=>{
                    console.log(val);
                    expect(val).to.equal(null);
                    done();
                }).catch(e=>done(e));
            }).catch(e=>done(e));
        }).catch((e:Error)=>done(e));
    });

});