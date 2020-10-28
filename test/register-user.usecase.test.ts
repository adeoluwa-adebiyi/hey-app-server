import "../app/appregistry.registry"
import { container } from "tsyringe";
import { PasswordHasherSpec } from "../app/common/core/hashers/contract/hasher.interface";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { expect } from "chai";
import { RegisterUserUsecase, RegisterUserUsecaseParams, UserRegistrationResponse } from "../app/domain/usecases/register-user.usecase";
import { UserModel } from "../app/domain/entities/user.model";
import { userLoginCredentials, USER_REGISTRATION_CREDENTIALS } from "./test.data";
import { database } from "faker";
import { afterTestRoutine, beforeTestRoutine } from "./test-routines";
import { InvalidArgumentsException } from "../app/common/exceptions/invalid-arguments.exception";
import { emptyDB, seedDB } from "../seed_db";
import { exit } from "process";
import { UserRepositorySpec } from "../app/domain/repositories/repository.interface";


const passwordHasher: PasswordHasherSpec = container.resolve("PasswordHasherSpec");

const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");

const USER_TABLE: string = "bb";


describe("Tests RegisterUserUsecase", ()=>{

    const userPassword: string = "jellyjones44$$";

    const userCredentials = USER_REGISTRATION_CREDENTIALS;

    const { password } = userCredentials;

    const validUser:UserModel =  new UserModel().fromJSON(userCredentials);

    const database: DatabaseSpec = container.resolve("DatabaseSpec");

    let validPasswordHash: string;


    before(async()=>{
        validPasswordHash = await passwordHasher.hashPassword(password);
        database.connect();
        emptyDB(database).then(async()=>{
            await seedDB(database);
        });
    });

    it("Should throw InvalidArgumentsException on form validation failure", async()=>{
        try{
            const userRegResponse = await new RegisterUserUsecase().execute(<RegisterUserUsecaseParams>{});
        }catch(e){
            expect(e).to.be.instanceOf(InvalidArgumentsException);
        }
    });

    it("Should register a new user with a valid UserModel persisted", async()=>{
        setTimeout(()=>database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email = $1`,[userCredentials.email]).then(async()=>{
            const userRegResponse: UserRegistrationResponse = await new RegisterUserUsecase().execute({...userCredentials});
            expect(JSON.stringify(userRegResponse.user.toJSONWithAuthCred())).to.equal(JSON.stringify({...validUser.toJSON(), id: userRegResponse.user.id, passwordHash: userRegResponse.user.passwordHash}));
        }),1000);
    });

    it("Should register a new user with a valid password hash", async()=>{
        const userMail="wilkinson@mail.com";
        setTimeout(()=>database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email = $1`,[userMail]).then(async()=>{
            database.getConnector().query(`DELETE FROM ${USER_TABLE} WHERE email = $1`,[userCredentials.email]).then(async()=>{
                const userRegResponse: UserRegistrationResponse = await new RegisterUserUsecase().execute({...userCredentials});
                expect( await  passwordHasher.verifyPassword(userRegResponse.user.toJSONWithAuthCred().passwordHash, userCredentials.password)).to.equal(true);
            });

        }),1000);
    });

    // after(()=>{
    //     exit(0);
    // })

});