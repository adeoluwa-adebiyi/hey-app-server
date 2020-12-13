import "reflect-metadata";
import "../app/appregistry.registry";
import { expect } from "chai";
import { container } from "tsyringe";
import { UserModel } from "../app/domain/entities/user.model";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import fs from "fs";
import path from "path";
import { ObjectNotFoundException } from "../app/common/exceptions/object-not-found.exception";
import { USER_REGISTRATION_CREDENTIALS } from "./test.data";
import { emptyDB, seedDB } from "../seed_db";
import { UserRepositorySpec } from "../app/domain/repositories/repository.interface";

const USER_TABLE = "bb";
const userRepository:UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");
const userId:number = 1;
const invalidUserId:any = {email:"hdkjk@mail.com"};

const userCredentials: any = USER_REGISTRATION_CREDENTIALS;

const validModel = new UserModel().fromJSON(userCredentials);

describe("Tests UserRepository functionality", ()=>{

    let users: Array<any>;

    before((done)=>{
        database.connect().then(()=>{
            const fixture  =  JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString());
            users = { users } = fixture;
            emptyDB(database).then(()=>{
                seedDB(database).then(()=>{
                    done();
                })
            });
        })

    });

    it("Should fetch a user by id from datasource correctly", (done)=>{
        setTimeout(()=>{
                const fixture  =  JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString());
                const { users } = fixture;
                userRepository.getUserById({email:users[0].email}).then((res:any)=>{
                    expect(JSON.stringify((res.toJSON()))).to.equal(JSON.stringify(new UserModel().fromJSON({...users[0], id:res.id}).toJSON()));
                    expect(res.toJSONWithAuthCred()).to.haveOwnProperty("passwordHash");
                    done();
                }).catch((e:Error)=>{
                    done(e);
                })
        },10000);
    });

    it("Should return ObjectNotFoundException on wrong user id",(done)=>{
        setTimeout(()=>{
                userRepository.getUserById(invalidUserId).then((queryResponse:any)=>{
                    expect(false).to.equal(true);
                }).catch((e:any)=>{
                    if(e instanceof ObjectNotFoundException){
                        expect(true).equals(true);
                        done();
                    }
                });
                
        },10000);
    });

    it("Should correctly create new users from credentials", (done)=>{
        setTimeout(()=>{
            const { email } = userCredentials;
            database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email=$1`,[email]).then((queryResponse:any)=>{
                userRepository.createUser({...userCredentials}).then((user: UserModel)=>{
                    expect(JSON.stringify(user.toJSONWithAuthCred())).to.equal(JSON.stringify({...validModel.toJSONWithAuthCred(), id:user.id, passwordHash: user.passwordHash}));
                    done();
                }).catch((e:any)=>done(e));
            });
        },10000);
    });

    it("Should correctly delete a user", (done)=>{
        setTimeout(()=>
            database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email = $1`,[userCredentials.email]).then((res:any)=>{
                userRepository.createUser({...userCredentials}).then((user: UserModel)=>{
                    userRepository.deleteUser({...userCredentials}).then((queryResponse:any)=>{
                        userRepository.getUserById({...userCredentials}).then((_user:UserModel)=>{
                            done(Error("Test expected to throw ObjectNotFoundException"));
                        }).catch((e:any)=>{
                            if(e instanceof ObjectNotFoundException)
                                done()
                            else
                                done(e);
                        });
                    }).catch((e:Error)=>{
                        done(e)
                    })
                }).catch((e:Error)=>{
                    done(e);
                })
                
            }),10000);
    });

    // after(()=>{
    //     exit(0);
    // })

})