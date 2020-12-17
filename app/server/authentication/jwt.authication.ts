import { AuthenticationSpec } from "../contracts/authenticationspec.interface";
import express, { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TokenAuthSpec } from "../contracts/tokenauthspec.interface";
import { UserRepositorySpec } from "../../domain/repositories/repository.interface";
import { nextTick } from "process";
import { UserModel } from "../../domain/entities/user.model";
import { AppRequest } from "../../routes/express/contracts/requests.interface";
import { ACCESS_JWT_COOKIE_NAME } from "../../config/app.config";


@injectable()
export class JWTAuthentication implements AuthenticationSpec<express.RequestHandler>{

    constructor(
        @inject("TokenAuthSpec") private tokenAuthentication?: TokenAuthSpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec){}

    provideAuthentication(exemptedRoutes:Array<string>): express.RequestHandler{
        
        const requestHandler: express.RequestHandler = async(req:AppRequest, res:Response, next)=>{
            let exempted = false;

            try{

                try{

                    console.log("ATTEMPT");

                    // JWT Header Auth
                    if(req.header("Authorization")){
                        const bearer = req.header("Authorization").split(" ")[1];
                        const decoded:any = await this.tokenAuthentication.decodeToken(bearer);
                        const user:UserModel = await this.userRepository.getUserById({id: decoded.body.sub});
                        req.user = user;
                    }else{
                        req.user = null
                    }

                    // HTTP Cookie Auth

                    if(req.cookies[ACCESS_JWT_COOKIE_NAME]){
                        const jwt: string = req.cookies[ACCESS_JWT_COOKIE_NAME];
                        const decoded:any = await this.tokenAuthentication.decodeToken(jwt);
                        const user:UserModel = await this.userRepository.getUserById({id: decoded.body.sub});
                        req.user = user;
                    }

                }catch(e){

                }

                for(let route of exemptedRoutes){
                    if(req.originalUrl.toString() === route.toString()){
                        exempted = true;
                        break;
                    }
                }
                
                if(exempted){
                    next();
                    return;
                }

                if(!req.headers.authorization && !req.cookies[ACCESS_JWT_COOKIE_NAME])
                    throw {message: "Authorization detail is required"};

                const authCookieJWT:boolean = await  new Promise((resolve)=>this.tokenAuthentication.verify(req.cookies[ACCESS_JWT_COOKIE_NAME], (err:any, verifiedJwt: any)=>{
                        if(err){
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                }));


                const authHeaderJWT: boolean = await new Promise((resolve)=>this.tokenAuthentication.verify(req.headers.authorization?.replace("Bearer ", ""), (err:any, verifiedJwt: any)=>{
                    if(err){
                       resolve(false);
                    }else{
                        resolve(true);
                    }
                }));

                if(authCookieJWT || authHeaderJWT){
                    next();
                    return;
                }else{
                    res.status(401).send({message: "Authentication failed"})
                }

            }catch(e){
                res.status(401).send(e);
            }
        }
        return requestHandler;
    }
}