import { AuthenticationSpec } from "../contracts/authenticationspec.interface";
import express, { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TokenAuthSpec } from "../contracts/tokenauthspec.interface";
import { UserRepositorySpec } from "../../domain/repositories/repository.interface";
import { nextTick } from "process";

@injectable()
export class JWTAuthentication implements AuthenticationSpec<express.RequestHandler>{

    constructor(
        @inject("TokenAuthSpec") private tokenAuthentication?: TokenAuthSpec,
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec){}

    provideAuthentication(exemptedRoutes:Array<string>): express.RequestHandler{
        
        const requestHandler: express.RequestHandler = (req:Request, res:Response, next)=>{
            let exempted = false;
            try{

                for(let route of exemptedRoutes){
                    if(req.originalUrl.toString() === route.toString()){
                        exempted = true;
                        break;
                    }
                }
                
                if(exempted){
                    console.log("HEADERS:");
                    console.log(req.get("Authorization"));
                    // const bearer = req.header("Authorization").split(" ")[1];
                    // this.tokenAuthentication.decodeToken(bearer).then(async(decoded:any)=>{
                    //     req.user = await this.userRepository.getUserById({id: decoded.sub});
                    //     console.log("DECODED_USER: ");
                    //     console.log(req.user);
 
                    // })
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
                    }
                });

            }catch(e){
                res.status(401).send(e);
            }
        }
        return requestHandler;
    }
}