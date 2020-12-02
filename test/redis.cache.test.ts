import "reflect-metadata";
import "../app/appregistry.registry";
import { RedisClient, createClient, ClientOpts } from "redis";
import { RedisCache } from "../app/data/datasources/redis.cache";
import {
    REDIS_DB,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    REDIS_URL,
    REDIS_USERNAME
} from "../app/config/app.config";
import { expect } from "chai";


const redisCache: RedisCache = new RedisCache(createClient(<ClientOpts>{
    host:REDIS_HOST,
    password:REDIS_PASSWORD,
    db:0,
    port:REDIS_PORT,
    url:REDIS_URL
}));


describe("Tests Redis Cache for functionality", ()=>{

    beforeEach(()=>{
        const val = 89;
        redisCache.set("data", val);
    });

    it("Should set key-value relationships correctly", (done)=>{
        setTimeout(()=>{

            const val = "67";
            redisCache.set("data",val).then((_)=>{
                redisCache.get("data").then((res)=>{
                    console.log(`DATA: ${res}`);
                    expect(res.toString()).to.equal(val.toString());
                    done();
                }).catch((e)=>done(e));
            }).catch(e=>done(e));


        },5000);
    });

    it("Should return already set values", (done)=>{
        setTimeout(()=>{
            const val = "89";
            redisCache.get("data").then((data)=>{
                expect(data).to.equal(val);
                done();
            }).catch((e)=>done(e));
        },5000);
    });

    it("Should correctly reset Redis instance", (done)=>{
        setTimeout(()=>{
            redisCache.reset().then((_)=>{
                redisCache.get("data").then((val:any)=>{
                    expect(val).to.equal(null);
                    done();
                }).catch((e)=>done(e));
            }).catch((e)=>done(e));
        },5000);
    });


    it("Should correctly disconnect from Redis instance", (done)=>{
        setTimeout(()=>{
                redisCache.disconnect();
                redisCache.get("data").then((_)=>{
                    done(Error("Expected to fail"))
                }).catch((e)=>done());
        },5000);
        
    });

});