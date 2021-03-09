import Knex from "knex-ts";
import { autoInjectable, inject, injectable } from "tsyringe";
import { getAutomaticTypeDirectiveNames } from "typescript";
import { ObjectNotFoundException } from "../../../common/exceptions/object-not-found.exception";
import { UserAuthId, UserModel, UserWithAuthCredJSON } from "../../../domain/entities/user.model";
import { InvalidArgumentsException } from "../../../common/exceptions/invalid-arguments.exception";
import { RegisterUserUsecaseParams } from "../../../domain/usecases/register-user.usecase";
import { DatabaseSpec } from "../../datasources/datasource.interface";
import { UserRepositorySpec } from "../repository.interface";


const USER_TABLE = "app-user";


@autoInjectable()
export class KnexUserRepository implements UserRepositorySpec{

    constructor(@inject("DatabaseSpec")private database?: DatabaseSpec){}


    async deleteUser(userCredentials: UserAuthId): Promise<void> {

        const { email, id } = userCredentials;

        if(!userCredentials)
            throw new InvalidArgumentsException("UserAuthId must not be null");

        if(!email && !id)
            throw new InvalidArgumentsException("email and id cannot both be null");

        if(email)
            await ((this.getDatabaseConnector())(USER_TABLE).where("email", email).delete());

        if(id)
            await ((this.getDatabaseConnector())(USER_TABLE).where("id", id).delete());
    }

    async getUserById(userId: UserAuthId): Promise<UserModel> {
        const {email, id } = userId;
        if(id){
            const response = await ((this.getDatabaseConnector()))(USER_TABLE).where({id:id}).select();
            if(!response || response.length===0)
                throw new ObjectNotFoundException(`User with id ${id} does not exist`);
            return new UserModel().fromJSON(response[0]);
        }

        if(email){
            const response = await ((this.getDatabaseConnector()))(USER_TABLE).where({email}).select();
            if(!response || response.length===0)
                throw new ObjectNotFoundException(`User with id ${id} does not exist`);

            return new UserModel().fromJSON(response[0]);
        }
        
    }

    async createUser(userCredentials: UserWithAuthCredJSON): Promise<UserModel> {
        try{
            let json = new UserModel().fromJSON(userCredentials).toJSON();
            (await (this.getDatabaseConnector())(USER_TABLE).insert({...json}));
            return new UserModel().fromJSON(await (this.getDatabaseConnector())(USER_TABLE).where({email: userCredentials.email}).select("*"));
        }catch(e){
            console.log(e);
        }
    }
    
    getDatabaseConnector(): Knex {
        return this.database.getConnector();
    }

}