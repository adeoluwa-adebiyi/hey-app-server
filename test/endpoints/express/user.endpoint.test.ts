import "reflect-metadata";
import "../../../app/appregistry.registry";
import path from "path";
import { container } from "tsyringe";
import { DatabaseSpec } from "../../../app/data/datasources/datasource.interface";
import { UserModel, UserProfileJSON } from "../../../app/domain/entities/user.model";
import { UserRepositorySpec } from "../../../app/domain/repositories/repository.interface";
import { emptyDB, seedDB } from "../../../seed_db";
import fs from "fs";
import { RoutableWebServerSpec, WebServerSpec } from "../../../app/server/contracts/webserverspec.interface";
import { UserRouter, USER_ENDPOINT } from "../../../app/routes/express/user.route";
import { TokenAuthSpec } from "../../../app/server/contracts/tokenauthspec.interface";
import { claims } from "../../test.data";
import { expect } from "chai";
import { GetUserProfileUsecase, GetUserProfileUsecaseResponse } from "../../../app/domain/usecases/user.usecase";
import Axios from "axios";
import supertest from "supertest";
import { ExpressWebServer } from "../../../app/server/express.webserver";

const userRepository: UserRepositorySpec = container.resolve("UserRepositorySpec");
const database: DatabaseSpec = container.resolve("DatabaseSpec");
let users: any[];
const webServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");

const tokenAuthAlgorithm: TokenAuthSpec = container.resolve("TokenAuthSpec");

let CLAIMS: any = claims;

const authHeaders = (sub: number) => {

    CLAIMS["sub"] = sub;

    return {
        headers: {
            "Authorization": `Bearer ${tokenAuthAlgorithm.generateToken(CLAIMS)}`
        },
    }
};

describe("Test User endpoint for functionality", () => {

    beforeEach((done) => {
        webServer.addRoute(USER_ENDPOINT, UserRouter);
        // webServer.listen(4000, "127.0.0.1");
        users = JSON.parse(fs.readFileSync(path.resolve("./app/data/fixtures/users.fixture.json")).toString()).users.map((user: any) => new UserModel().fromJSON(user));
        database.connect().then(() => {
            emptyDB(database).then(() => {
                seedDB(database).then(() => {
                    done();
                });
            });
        })
    });

    it("User-me endpoint returns valid user information", (done) => {
        setTimeout(() => {
            userRepository.getUserById({email: users[0].email}).then((user: UserModel)=>{
                supertest((<ExpressWebServer>webServer).application)
                    .get(`${USER_ENDPOINT}/me`)
                    .set("Authorization", authHeaders(user.id)["headers"]["Authorization"])
                    .expect(200).then(async (response) => {

                    new GetUserProfileUsecase().execute({ id: (await userRepository.getUserById({ email: users[0].email })).id })
                    .then((res: GetUserProfileUsecaseResponse) => {
                        const userProfile: UserProfileJSON = res.data;
                        expect(JSON.stringify({ ...userProfile, id: null })).to.equal(JSON.stringify({ ...response.body.data, id: null }));
                        expect(new UserModel().fromJSON(res.data).id).to.be.a("number");
                        expect(JSON.stringify(response.body.data)).to.equal(JSON.stringify(res.data));
                        done();
                    }).catch((e) => {
                        done(e);
                    });

                })
            })

        }, 5000);
    });

});