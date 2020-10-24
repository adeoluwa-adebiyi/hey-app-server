import Knex from "knex-ts";
import { UrlDatabase } from "./datasource.interface";
import fs from "fs";
import path from "path";
import { InvalidConnectionURLException } from "../../common/exceptions/invalid-connection-url.exception";

export enum KnexClient{
    MYSQL="mysql",
    SQLITE3="sqlite3",
    POSTGRESQL="postgresql"
}

export class KnexSqlDatabase implements UrlDatabase<Knex>{

    private url: string;

    private client:Knex;

    private clientType: KnexClient;

    constructor(clientType: KnexClient, url?: string){
        this.clientType = clientType;
        this.url = url;
    }

    get connectionURL():string{
        return this.url;
    }

    setConnection(url: string): void {
        this.url = url;
    }

    async connect(): Promise<Knex> {

        console.log("ATTEMP CONNECTION");

        if(!this.url)
            throw new InvalidConnectionURLException("No url connection provided");

        if(this.clientType === KnexClient.SQLITE3){
            console.log("CWD: "+path.resolve(`${this.url}`));
            try{
                // let file =  fs.readFileSync("file://"+this.url);
                // if(!file)
                //     throw new InvalidConnectionURLException("SQLite3 database does not exist");
                // else
                //     file = undefined;
                return this.client = Knex({
                    client: this.clientType,
                    connection: {
                        filename: ":memory:"
                    },
                    // pool: {
                    //     min: 1,
                    //     max: 1,
                    // },
                    migrations: {
                        directory: path.resolve('../migrations'),
                        tableName: 'knex_migrations',
                    },
                });
            }catch(e){
                throw  new InvalidConnectionURLException("SQLite3 database does not exist");
            }
               
        }

        else{

        this.client = Knex({
            client: this.clientType,
            connection: this.url
        });
    }

        return this.client;
    }

    getConnector():Knex {
        return this.client
    }

}