import "reflect-metadata";
import { autoInjectable, inject } from "tsyringe";
import "../../appregistry.registry";
import { UserAuthId, UserModel, UserProfileJSON } from "../entities/user.model";
import { UserRepositorySpec } from "../repositories/repository.interface";
import { UseCaseSpec } from "./contracts/usecasespec.interface";


export interface GetUserProfileUsecaseResponse{
    data: UserProfileJSON;
}

@autoInjectable()
export class GetUserProfileUsecase implements UseCaseSpec<Promise<GetUserProfileUsecaseResponse>>{

    constructor(
        @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec){}

   async execute(params: UserAuthId): Promise<GetUserProfileUsecaseResponse> {
        try{
            const user = await this.userRepository.getUserById(params);
            return <GetUserProfileUsecaseResponse>{
                data: user.toJSON()
            }
        }catch(e){
            throw e;
        };
    }

}