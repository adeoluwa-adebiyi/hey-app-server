import "reflect-metadata";
import { Router, Request, Response } from "express";
import { AuthenticateUserUsecase } from "../../domain/usecases/authenticate-users.usecase";
import { InvalidLoginCredentialsException } from "../../common/exceptions/invalid-login-credentials.exception";

export const AUTH_USER_ROUTE_ENDPOINT:string = "/auth";

const router: Router = Router();

router.post("/", async(req:Request, res: Response)=>{
    try{
        const params = req.body;
        const response = await new AuthenticateUserUsecase().execute({...params});
        res.send({
            data:{
                ...response
            }
        });
    }catch(e){
        if(e instanceof InvalidLoginCredentialsException){
            res.send({
                error: e.constructor.name,
                message: e.message
            });
        }
        else{
            res.status(500).send({
                error: "Server error",
                message: ""
            });
        }
    }
});

export const AuthRouter =  router;
