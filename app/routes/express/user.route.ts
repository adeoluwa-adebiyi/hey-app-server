import { Request, Response, Router } from "express";
import { ObjectNotFoundException } from "../../common/exceptions/object-not-found.exception";
import { GetUserProfileUsecase } from "../../domain/usecases/user.usecase";
import { AppRequest } from "./contracts/requests.interface";

const router:Router = Router();

router.get("/me", async(req:Request, res:Response)=>{
    try{
        const request = req as AppRequest;
        const response = await new GetUserProfileUsecase().execute({id:request.user.id});
        res.send({
            ...response
        });
    }catch(e){
        console.log(e);
        if (e instanceof ObjectNotFoundException){
            res.sendStatus(404);
            return;
        }

        res.sendStatus(500);
        return;
    }
});

export const USER_ENDPOINT = "/user";

export const UserRouter = router;