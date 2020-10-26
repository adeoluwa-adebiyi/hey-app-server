import Joi from "joi";
import "reflect-metadata";
import { autoInjectable, inject, singleton } from "tsyringe";
import { Serializable } from "../../common/core/contracts/serializable.interface";
import { PasswordHasherSpec } from "../../common/core/hashers/contract/hasher.interface";
import { UserRepositorySpec } from "../../data/repositories/repository.interface";
import { UserModel } from "../entities/user.model";
import { UseCaseSpec } from "./contracts/usecasespec.interface";
import { InvalidArgumentsException } from "../../common/exceptions/invalid-arguments.exception";

export interface UserRegistrationResponseJSON{
    user: UserModel
}

export interface RegisterUserUsecaseParams{
    firstname?: string;
    lastname?: string;
    email: string;
    password: string;
}

export interface UserRegistrationResponse{
    user: UserModel
}

@autoInjectable()
@singleton()
export class RegisterUserUsecase implements UseCaseSpec<Promise<UserRegistrationResponse>>{

    constructor(@inject("PasswordHasherSpec") private passwordHasher?: PasswordHasherSpec, @inject("UserRepositorySpec") private userRepository?: UserRepositorySpec){}

    async execute(params: RegisterUserUsecaseParams): Promise<UserRegistrationResponse> {
        if(!params)
            throw new InvalidArgumentsException("");

        if(!params.email)
            throw new InvalidArgumentsException("email field cannot be null");

        if(!params.password)
            throw new InvalidArgumentsException("password field cannot be null");

        return <UserRegistrationResponse>{
            user: await this.userRepository.createUser({...params, passwordHash: await this.passwordHasher.hashPassword(params.password)})
        }
        
    }


}