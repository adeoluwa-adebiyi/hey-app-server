import { Response, Router } from "express";
import { InvalidArgumentsException } from "../../common/exceptions/invalid-arguments.exception";
import { GetAllChatRoomMessagesUsecase } from "../../domain/usecases/chat-room-message.usecase";
import { AppRequest } from "./contracts/requests.interface";

const router = Router();

router.get("/:id", async(req: AppRequest, res: Response)=>{

    try{
        const {user} = req;
        const {id} = req.params;
        const chatRoomId =  id;
        const { offset=0, limit=50} = req.query;
        if(!user)
            throw Error("Authorization needed");

        if(!chatRoomId)
            throw new InvalidArgumentsException("chatRoomId cannot be null");

        const response = await new GetAllChatRoomMessagesUsecase().execute({chatRoomId, offset:Number(offset), limit:Number(limit)});
        res.send({
            data: response
        })

    }catch(e){

        if(e instanceof InvalidArgumentsException){
            res.status(500).send({
                message: e.message
            });
            return;
        }

        res.status(500).send({
            message: e.message
        });
    }

});

export const  ChatRoomMessagesRouter = router;