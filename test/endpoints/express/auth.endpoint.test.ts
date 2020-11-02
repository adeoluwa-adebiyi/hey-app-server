import Axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { expect } from "chai";
import { exit } from "process";
import { container } from "tsyringe";
import { SECRET } from "../../../app/config/app.config";
import { DatabaseSpec } from "../../../app/data/datasources/datasource.interface";
import { UserRepositorySpec } from "../../../app/domain/repositories/repository.interface";
import { RegisterUserUsecase, UserRegistrationResponse } from "../../../app/domain/usecases/register-user.usecase";
import { AuthRouter, AUTH_USER_ROUTE_ENDPOINT } from "../../../app/routes/express/auth.route";
import { RoutableWebServerSpec, WebServerSpec } from "../../../app/server/contracts/webserverspec.interface";
import { JWTTokenAuthAlgorithm } from "../../../app/server/core/jwt-token.token-auth";
import { emptyDB, seedDB } from "../../../seed_db";
import { ENDPOINT_HOST, userLoginCredentials, USER_REGISTRATION_CREDENTIALS } from "../../test.data"

const userCredentials = USER_REGISTRATION_CREDENTIALS;

const AUTH_USER_ROUTE = "/auth";

const webServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");

const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");

const database: DatabaseSpec = container.resolve("DatabaseSpec");

const USER_TABLE = "bb";


describe("Test Auth: /auth endpoint", ()=>{

    before((done)=>{
        const authRouter = AuthRouter;
        webServer.addRoute(AUTH_USER_ROUTE_ENDPOINT, authRouter);
        emptyDB(database).then(()=>{
            seedDB(database).then(()=>{
                done();
            })
        });
    })

    it("Should generate valid auth tokens for registered users", (done)=>{
        webServer.listen(80, "127.0.0.1");
        setTimeout(()=>userRepository.deleteUser({email: userLoginCredentials.username}).then(()=>{

            new RegisterUserUsecase().execute({...userLoginCredentials, email: userLoginCredentials.username}).then((userRegResponse: UserRegistrationResponse)=>{

                    const { email, password } = userCredentials;
            
                    Axios(<AxiosRequestConfig>{
                        method:'post',
                        url: "http://127.0.0.1"+AUTH_USER_ROUTE_ENDPOINT,
                        data:{
                            username: email,
                            password
                        },
                        
                    }).then((response:AxiosResponse)=>{

                        const {data} = response.data;
            
                        const  authToken = data;

                        if(data)
                            webServer.close();

                
                        new JWTTokenAuthAlgorithm(SECRET).verify( authToken.accessToken, (err:any, validatedToken:any)=>{
                            expect(err).to.equal(null);
                            expect(validatedToken).to.be.an("object");

                            new JWTTokenAuthAlgorithm(SECRET).verify( authToken.refreshToken, (err:any, validatedToken:any)=>{
                                expect(err).to.equal(null);
                                expect(validatedToken).to.be.an("object");
                                done();
                            });
                        });
                


                    }).catch((e)=>{
                        console.log(e);
                        done(e);
                    })
            
            }).catch((e:Error)=>{
                done(e);
            });
        }),1000);
    });

})