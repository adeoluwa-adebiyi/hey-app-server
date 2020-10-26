import "reflect-metadata";
import { Request, Response, Router } from "express";
import { RegisterUserUsecase } from "../../domain/usecases/register-user.usecase";
import { REGISTER_USER_ENDPOINT } from "../urls";
import { AuthTokenModel } from "../../domain/entities/auth-tokens.model";
import { container } from "tsyringe";
import { TokenAuthSpec } from "../../server/contracts/tokenauthspec.interface";
import { accessTokenExpiryDuration, refreshTokenExpiryDuration, UserAuthClaim } from "../../domain/usecases/authenticate-users.usecase";


const jwtAuthService: TokenAuthSpec = container.resolve("TokenAuthSpec");

const router:Router = Router();


router.post(REGISTER_USER_ENDPOINT, async(req: Request, res: Response)=>{
    try{
        const params = req.body;
        const response = await new RegisterUserUsecase().execute({...params});
        if(response && response.user){
            const { user } = response;
            const accessToken = jwtAuthService.generateToken(<UserAuthClaim>{
                id: user.id,
                expiresAt: accessTokenExpiryDuration()
            });
            const refreshToken = jwtAuthService.generateToken(<UserAuthClaim>{
                id: user.id,
                expiresAt: refreshTokenExpiryDuration()
            });
            res.status(200).send({
                data: {
                    ... new AuthTokenModel(accessToken, refreshToken).toJSON()
                }
            });
        }
        else{
            throw Error("Interbal error");
        }
    }catch(e){
        res.status(500).send({
            error: "Internal Server error",
            message: "Internal Server error",
        })
    }
});

export const IndexRouter = router;