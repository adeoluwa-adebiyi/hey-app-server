import { Client, Pool } from "pg";
import { InvalidArgumentsException } from "../../common/exceptions/invalid-arguments.exception";
import { CredentialDatabase, UrlDatabase } from "./datasource.interface";
import path from "path";

export class PostgresDatabase implements CredentialDatabase<Pool>{

    private client: Pool;
    private url: string;
    private host: string;
    private port: number;
    private user: string;
    private database: string;
    private password: string

    get connectionURL(): any{
        return {
            host: this.host,
            port: this.port,
            user: this.user,
            database: this.database,
            password: this.password
        };
    };

    setConnection(host: string, port: number, user: string, database: string, password: string): void {
        this.host = host;
        this.port = port;
        this.user = user;
        this.database = database;
        this.password = password;
    }

    async connect() {
        if(!this.host)
            throw new InvalidArgumentsException("database host cannot be null!");

        if(!this.port)
            throw new InvalidArgumentsException("database port cannot be null!");

        if(!this.user)
            throw new InvalidArgumentsException("database user cannot be null!");

        if(!this.database)
            throw new InvalidArgumentsException("database name cannot be null!");

        // if(!this.password)
        //     throw new InvalidArgumentsException("database password cannot be null!");

        this.client = new Pool({
        host: this.host,
        port: this.port,
        user: this.user,
        database: this.database,
        password: this.password,
        // ssl:true
        // ssl:{
        //     cert: path.resolve("./app/data/datasources/pg.pem")
        // }
        // keepAlive: false
       })

       return await this.client.connect();
    }
    
    getConnector():Pool {
        return this.client;
    }
}