import Axios from "axios"
import { expect } from "chai";
import { exit } from "process";
import { container } from "tsyringe";
import { DatabaseSpec } from "../../../app/data/datasources/datasource.interface";
import { UserRepositorySpec } from "../../../app/data/repositories/repository.interface";
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

    before(async()=>{
        const authRouter = AuthRouter;
        webServer.addRoute(AUTH_USER_ROUTE_ENDPOINT, authRouter);
        emptyDB(database).then(async()=>{
            await seedDB(database);
        });
    })

    it("Should generate valid auth tokens for registered users", async()=>{
        webServer.listen(80, "127.0.0.1");
        userRepository.deleteUser({email: userLoginCredentials.username}).then(()=>{

        new RegisterUserUsecase().execute({...userLoginCredentials, email: userLoginCredentials.username}).then(async (userRegResponse: UserRegistrationResponse)=>{

            try{

                const { email, password } = userCredentials;
        
                const response  = await Axios({
                    method:'post',
                    url: "http://127.0.0.1"+AUTH_USER_ROUTE_ENDPOINT,
                    data:{
                        username: email,
                        password
                    }
                });
                
                const {data} = response.data;
        
                const { authToken } = data;

                if(data)
                    webServer.close();
        
                new JWTTokenAuthAlgorithm().verify( authToken.accessToken, (err:any, validatedToken:string)=>{
                    expect(err).to.equal(null);
                    expect(validatedToken).to.be("string");
                });
        
                new JWTTokenAuthAlgorithm().verify( authToken.refreshToken, (err:any, validatedToken:string)=>{
                    expect(err).to.equal(null);
                    expect(validatedToken).to.be("string");
                });
        
            }catch(e){
                console.log(e);
            }
        
            });
        });
    });

})