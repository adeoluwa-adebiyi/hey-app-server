import { connect } from "http2";
import { Client, Pool } from "pg";
import { autoInjectable, inject, injectable } from "tsyringe";
import { getAutomaticTypeDirectiveNames, transform } from "typescript";
import { ObjectNotFoundException } from "../../../common/exceptions/object-not-found.exception";
import { UserAuthId, UserModel, UserWithAuthCredJSON } from "../../../domain/entities/user.model";
import { InvalidArgumentsException } from "../../../common/exceptions/invalid-arguments.exception";
import { RegisterUserUsecaseParams } from "../../../domain/usecases/register-user.usecase";
import { DatabaseSpec } from "../../datasources/datasource.interface";
import { IConnected } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { UserRepositorySpec } from "../../../domain/repositories/repository.interface";


const USER_TABLE = "bb";
const DELETE_USER_BY_EMAIL_QUERY = `DELETE FROM "${USER_TABLE}" WHERE email = $1`;
const DELETE_USER_BY_ID_QUERY = `DELETE FROM "${USER_TABLE}" WHERE id = $1`;
const GET_USER_BY_ID_QUERY = `SELECT * FROM "${USER_TABLE}" WHERE id = $1`;
const GET_USER_BY_EMAIL_QUERY = `SELECT * FROM "${USER_TABLE}" WHERE email = $1`;
const GET_ALL_USERS_QUERY = `SELECT * FROM "${USER_TABLE}"`;
const CREATE_NEW_USER_QUERY = `INSERT into "${USER_TABLE}"(firstname, lastname, dob, email, passwordhash, pic, username) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`;


@autoInjectable()
@injectable()
export class PgSQLUserRepository implements UserRepositorySpec{

    constructor(@inject("DatabaseSpec")private database?: DatabaseSpec){}


    async deleteUser(userCredentials: UserAuthId): Promise<any> {

        const { email, id } = userCredentials;

        if(!userCredentials)
            throw new InvalidArgumentsException("UserAuthId must not be null");

        if(!email && !id)
            throw new InvalidArgumentsException("email and id cannot both be null");

        if(email)
            return await ((this.getDatabaseConnector()).query(DELETE_USER_BY_EMAIL_QUERY,[email]));

        if(id)
            return await ((this.getDatabaseConnector()).query(DELETE_USER_BY_ID_QUERY,[id]));
    }

    async getUserById(userId: UserAuthId): Promise<UserModel> {

        const {email, id } = userId;
        if(id){
            const response = await ((this.getDatabaseConnector())).query(GET_USER_BY_ID_QUERY,[id]);
            if(response.length ===0){
                throw new ObjectNotFoundException(`User with id ${id} does not exist`);
            }
            return new UserModel().fromJSON(( response[0] ));
        }

        if(email){
            const response = await ((this.getDatabaseConnector())).query(GET_USER_BY_EMAIL_QUERY,[email]);
            if(response.length ===0)
                throw new ObjectNotFoundException(`User with email ${email} does not exist`);

            return new UserModel().fromJSON(response[0]);
        }
        
    }

    async createUser(userCredentials: UserWithAuthCredJSON): Promise<UserModel> {
        const { firstname, lastname, dob, email, passwordHash, pic, username } = userCredentials;
        const response = await (
        this.getDatabaseConnector().one(CREATE_NEW_USER_QUERY,[ firstname, lastname, dob, email, passwordHash, pic, username ]));
        return new UserModel().fromJSON( response );
    }
    
    getDatabaseConnector(): IConnected<{}, IClient> {
        return this.database.getConnector();
    }

}