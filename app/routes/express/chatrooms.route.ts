import { Response, Router } from "express";
import { GetUserChatRoomsUsecase } from "../../domain/usecases/get-user-chatrooms.usecase";
import { AppRequest } from "./contracts/requests.interface";


const router: Router = Router();

router.get("/", async(req: AppRequest, res: Response)=>{

    console.log("INDEX_ROUTE:");
    try{
        const response = await new GetUserChatRoomsUsecase().execute({userId: req.user.id});
        res.status(200).send({
            data:{
                ...response
            }
        });
    }catch(e){
        res.status(500).send({
            message: e.message
        });
    }

})

export const ChatRoomsRouter = router;
export const CHATROOMS_ENDPOINT = "/chatrooms";