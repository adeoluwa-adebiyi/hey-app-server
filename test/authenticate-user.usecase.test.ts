import { UserAuthId } from "../app/domain/entities/user.model";
// import "reflect-metadata";
import "../app/appregistry.registry"
import { AuthenticateUserUsecase, UserLoginCredentials } from "../app/domain/usecases/authenticate-users.usecase";
import { JWTAuthentication } from "../app/server/authentication/jwt.authication";
import { JWTTokenAuthAlgorithm } from "../app/server/core/jwt-token.token-auth";
import { PasswordHasherSpec } from "../app/common/core/hashers/contract/hasher.interface";
import { container } from "tsyringe";
import { expect } from "chai";
import { UserRepositorySpec } from "../app/domain/repositories/repository.interface";
import { DatabaseSpec } from "../app/data/datasources/datasource.interface";
import { RegisterUserUsecase, UserRegistrationResponse } from "../app/domain/usecases/register-user.usecase";
import { userLoginCredentials } from "./test.data";
import { TokenAuthSpec } from "../app/server/contracts/tokenauthspec.interface";
import { emptyDB, seedDB } from "../seed_db";
import { InvalidLoginCredentialsException } from "../app/common/exceptions/invalid-login-credentials.exception";



const passwordHasher: PasswordHasherSpec = container.resolve("PasswordHasherSpec");
const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");
const tokenAuthSpec: TokenAuthSpec = container.resolve("TokenAuthSpec");
const USER_TABLE = "bb";
const invalidPassword = "itsacrazyworld";

describe("Tests AuthenticateUser usecase functionality", ()=>{

    before(async ()=>{
        await database.connect();
        emptyDB(database).then(async()=>{
            await seedDB(database);
        });
    })

    const { username, password } = userLoginCredentials;

    it("Should return valid AuthTokenModels for valid login credentials", (done)=>{
        setTimeout(()=>
            database.getConnector().query(`DELETE FROM ${USER_TABLE} where email = $1 `,[userLoginCredentials.username]).then(()=>{
            new RegisterUserUsecase().execute({...userLoginCredentials, email: userLoginCredentials.username}).then(async (userRegResponse: UserRegistrationResponse)=>{
                const authToken = await new AuthenticateUserUsecase().execute({...userLoginCredentials});
                tokenAuthSpec.verify( authToken.accessToken, (err:any, validatedToken:string)=>{
                    expect(err).to.equal(null);
                    expect(validatedToken).to.be.instanceOf(Object);
                    done();
                });
                });
            }).catch((e:any)=>{
                console.log("Error: ");
                console.log(e);
                done(e);
                })
    //    })
        , 5000);
    }); 

    it("Should return InvalidLoginCredentialsException for invalid login credentials", (done)=>{
        setTimeout(()=>
        database.getConnector().query(`DELETE FROM ${USER_TABLE} where email = $1 `,[userLoginCredentials.username]).then(()=>{
        new RegisterUserUsecase().execute({...userLoginCredentials, email: userLoginCredentials.username}).then(async (userRegResponse: UserRegistrationResponse)=>{
            
            try{
                const authToken = await new AuthenticateUserUsecase().execute({...userLoginCredentials, password: invalidPassword});
                expect(authToken).to.equal(undefined);
                done(Error("Test Failed"));
            }catch(e){
                expect(e).to.be.instanceOf(InvalidLoginCredentialsException);
                done();
            }

            });
           })
        ,5000);
    }); 

})