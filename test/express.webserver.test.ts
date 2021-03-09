import { expect } from "chai";
import Axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import { number, object } from "joi";
import { RoutableWebServerSpec } from "../app/server/contracts/webserverspec.interface";
import { ExpressWebServer } from "../app/server/express.webserver";
import { Router, Request, Response } from "express";
import "../app/appregistry.registry";
import { container } from "tsyringe";
import { TokenAuthSpec } from "../app/server/contracts/tokenauthspec.interface";
import { claims } from "./test.data";

const tokenAuthAlgorithm:TokenAuthSpec = container.resolve("TokenAuthSpec");

const axiosTestOptions = {
    validateStatus: ()=>true
}

const {port, address, route, header} = {
    port: 80,
    address: "127.0.0.1",
    route: "/test",
    header: {
        "Authorization": `Bearer ${ tokenAuthAlgorithm.generateToken(claims) }`
    }
};


describe("Tests Express webserver listen implementation", async()=>{

    const appServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");


    before((done)=>{

        const router:Router = Router();
        router.get(route, (req, res)=>{
            res.send({message: "Hello World"});
        })
        appServer.addRoute("/", router);
        appServer.listen(port, address);
        done();

    });


    it("Should respond to requests on port and address",async ()=>{

        const response = await Axios({
            method:"GET",
            url:"http://"+address+route,
            headers:{...header},
            ...axiosTestOptions
            // withCredentials: true
        });

        expect(response.status).to.equal(200);
        expect(response.status).to.be.a('number');
    })

    after(()=>{
        appServer.close();
    });
});

describe("Tests express webserver addRoute", async()=>{

    const appServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");


    before(()=>{
        const router:Router = Router();
        router.get(route, (req:Request, res:Response)=>{
            res.send({message: "Hello World"});
        })
        appServer.addRoute("/", router);
        appServer.listen(port, address);
    });

    it("Should respond to new route", async()=>{
        const response = await Axios({
            method:"GET",
            url:"http://"+address+route,
            headers:{...header},
            ...axiosTestOptions
        });

        expect(response.status).to.equal(200);
        expect(JSON.stringify(response.data)).to.equal(JSON.stringify({message: "Hello World"}));
    });

    after(()=>{
        appServer.close();
    });
    

})

describe("Tests express webserver Authentication", async()=>{

    const appServer: RoutableWebServerSpec = container.resolve("RoutableWebServerSpec");


    before(()=>{
        const router:Router = Router();
        router.get(route, (req:Request, res:Response)=>{
            res.send({message: "Hello World"});
        })
        appServer.addRoute("/", router);
        appServer.listen(port, address);
    });

    it("Should respond with 401 error on wrong authorization", async()=>{
            const response = await Axios({
                method:"GET",
                url:"http://"+address+route,
                headers:{
                    "Authorization": "Bearer 1234"
                },
                ...axiosTestOptions
            });

        expect(response.status).to.equal(401);
    });

    it("Should respond with 401 error on no authorization header", async()=>{
        const response = await Axios({
            method:"GET",
            url:"http://"+address+route,
            headers:{},
            ...axiosTestOptions
        });

        expect(response.status).to.equal(401);
});


    after(()=>{
        appServer.close();
    });
    

})