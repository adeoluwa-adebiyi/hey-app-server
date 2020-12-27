import "reflect-metadata";
import { Router, Request, Response } from "express";
import { AuthenticateUserUsecase } from "../../domain/usecases/authenticate-users.usecase";
import { InvalidLoginCredentialsException } from "../../common/exceptions/invalid-login-credentials.exception";
import { ACCESS_JWT_COOKIE_NAME, JWT_COOKIE_EXPIRY, REFRESH_JWT_COOKIE_NAME } from "../../config/app.config";

export const AUTH_USER_ROUTE_ENDPOINT:string = "/auth";

export const AUTH_WEB_USER_ROUTE_ENDPOINT:string = "/auth/web";


const router: Router = Router();

const AUTH_COOKIE_NAME = ACCESS_JWT_COOKIE_NAME;

const REFRESH_AUTH_COOKIE_NAME = REFRESH_JWT_COOKIE_NAME;

const AUTH_COOKIE_EXPIRY = JWT_COOKIE_EXPIRY;

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


router.post("/web", async(req:Request, res: Response)=>{
    try{
        const params = req.body;
        const response = await new AuthenticateUserUsecase().execute({...params});
        res.cookie("SameSite", "None",{secure:true});
        res.cookie(AUTH_COOKIE_NAME, response.accessToken, {maxAge: AUTH_COOKIE_EXPIRY, httpOnly: true, secure: true });
        res.cookie(REFRESH_AUTH_COOKIE_NAME, response.refreshToken, {maxAge: AUTH_COOKIE_EXPIRY, httpOnly: true, secure: true });
        res.send({
            jwt: {
                ...response
            }
        });
    }catch(e){
        console.log(e)
        if(e instanceof InvalidLoginCredentialsException){
            res.status(401).send({
                error: "Authentication Failed",
                message: "Invalid login attempt"
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


router.post("/test", async(req:Request, res: Response)=>{
    try{
        res.sendStatus(200);
    }catch(e){
        console.log(e)
        if(e instanceof InvalidLoginCredentialsException){
            res.status(401).send({
                error: "Authentication Failed",
                message: "Invalid login attempt"
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
