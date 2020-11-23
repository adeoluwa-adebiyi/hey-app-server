import { AuthenticationSpec } from "../contracts/authenticationspec.interface";
import express, { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TokenAuthSpec } from "../contracts/tokenauthspec.interface";
import { UserRepositorySpec } from "../../domain/repositories/repository.interface";
import { nextTick } from "process";
import { UserModel } from "../../domain/entities/user.model";

@injectable()
export class JWTAuthentication implements AuthenticationSpec<express.RequestHandler>{

    constructor(
        @inject("TokenAuthSpec") private tokenAuthentication?: TokenAuthSpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec){}

    provideAuthentication(exemptedRoutes:Array<string>): express.RequestHandler{
        
        const requestHandler: express.RequestHandler = async(req:any, res:any, next)=>{
            let exempted = false;

            try{

                try{
                    if(req.header("Authorization")){
                        const bearer = req.header("Authorization").split(" ")[1];
                        const decoded:any = await this.tokenAuthentication.decodeToken(bearer);
                        const user:UserModel = await this.userRepository.getUserById({id: decoded.body.sub});
                        req.user = user;
                    }else{
                        req.user = null
                    }

                }catch(e){
                    console.log(e);
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

                if(!req.headers.authorization)
                    throw {message: "Authorization header is required"};


                this.tokenAuthentication.verify(req.headers.authorization?.replace("Bearer ", ""), (err:any, verifiedJwt: any)=>{
                    if(err){
                        res.status(401).send({message: "Authentication failed"})
                    }else{
                        next();
                        return;
                    }
                });

            }catch(e){
                res.status(401).send(e);
            }
        }
        return requestHandler;
    }
}