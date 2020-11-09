import { Request, Response, Router } from "express";
import "reflect-metadata";
import { BaseException } from "../../common/exceptions/base.exception";
import { InvalidArgumentsException } from "../../common/exceptions/invalid-arguments.exception";
import { ObjectNotFoundException } from "../../common/exceptions/object-not-found.exception";
import { CreateChatRoomUsecase, DeleteChatRoomUsecase, GetChatRoomByUserIdUseCase } from "../../domain/usecases/create-chatroom.usecase";

export const CHATROOM_USER_ROUTE_ENDPOINT:string = "/chatroom";

const router: Router = Router();

router.get("/roomKey/:roomKey", async(req: Request, res: Response)=>{
    const { roomKey } = req.params;
    if(!roomKey)
        throw new InvalidArgumentsException("roomKey cannot be null");
    try{
        const response = await new GetChatRoomByUserIdUseCase().execute({roomKey});
        res.send({
            data:{
                ...response
            }
        })
    }catch(e){
        if(e instanceof InvalidArgumentsException){
            res.status(400).send({
                message: e.message
            });
            return;
        }
        if(e instanceof ObjectNotFoundException){
            res.status(404).send({
                message: e
            });
            return;
        }
        if(e instanceof BaseException)
            res.status(500).send({
                message: e.message
            });
        else{
            res.status(500).send({
                message: "Server error"
            })
        }
    }
});

router.delete("/roomKey/:roomKey", async(req: Request, res: Response)=>{
    const { roomKey } = req.params;
    if(!roomKey)
        throw new InvalidArgumentsException("roomKey cannot be null");
    try{
        const response = await new DeleteChatRoomUsecase().execute({roomKey});
        res.sendStatus(200);
    }catch(e){
        console.log(e);
        if(e instanceof InvalidArgumentsException){
            res.status(400).send({
                message: e.message
            });
            return;
        }
        if(e instanceof ObjectNotFoundException){
            res.status(404).send({
                message: e
            });
            return;
        }
        if(e instanceof BaseException)
            res.status(500).send({
                message: e.message
            });

        else{
            res.status(500).send({
                message: "Server error"
            });
        }
    }
});

router.post("/", async(req: Request, res: Response)=>{

    const { users } = req.body;

    if(!users)
        throw new InvalidArgumentsException("users cannot be null");
    try{
        const response = await new CreateChatRoomUsecase().execute({users});
        res.send({
            data:{
                chatRoom: response
            }
        })
    }catch(e){
        if(e instanceof InvalidArgumentsException){
            res.status(400).send({
                message: e.message
            });
            return;
        }
        if(e instanceof BaseException)
            res.status(500).send({
                message: e.message
            });
        else{
            res.status(500).send({
                message: "Server error"
            })
        }
    }
});

export const ChatRoomRouter = router;