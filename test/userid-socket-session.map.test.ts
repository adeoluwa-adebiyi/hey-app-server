import { expect, assert } from "chai";
import "reflect-metadata";
import { container } from "tsyringe";
import "../app/appregistry.registry";
import { WsSessionCache } from "../app/data/datasources/datasource.interface";
import { UserAuthId } from "../app/domain/entities/user.model";
import { UserIdSocketSessionMapSpec } from "../app/server/core/websocket/sessions/contracts/session.map.interface";

const uSMap:UserIdSocketSessionMapSpec = container.resolve("UserIdSocketSessionMapSpec");

// const cache:WsSessionCache = container.resolve("WsSessionCache");

describe("Tests UserIdSocketSessionMap for functionality", () => {


    it("Should correctly set key-value pairs", (done) => {
        // cache.reset().then(()=>{
            const SOCK_KEY_LIST = ["sock#54745"];
            const USER_ID = {id:78};
            uSMap.set(USER_ID, SOCK_KEY_LIST).then((_)=>{
                uSMap.get(USER_ID).then((val:Array<string>)=>{
                    expect(JSON.stringify(val)).to.equal(JSON.stringify(SOCK_KEY_LIST));
                    done();
                }).catch(e=>done(e));
            }).catch((e:Error)=>done(e));
        // });
    });

    it("Should correctly reset key-value pairs", (done) => {
        // cache.reset().then(()=>{
            const SOCK_KEY_LIST = ["sock#54745"];
            const USER_ID = {id:78};
            uSMap.set(USER_ID, SOCK_KEY_LIST).then(_=>{
                uSMap.reset().then(_=>{
                    uSMap.get(USER_ID).then((val:Array<string>)=>{
                        expect(val).to.equal(null);
                        done();
                    }).catch(e=>done(e));
                }).catch(e=>done(e));
            }).catch((e:Error)=>done(e));
        // });
    });

});