import { expect } from "chai";
import { InvalidConnectionURLException } from "../app/common/exceptions/invalid-connection-url.exception";
import { DB_HOST, DB_PASSWORD, DB_PORT, DB_URI, DB_USERNAME, DB_NAME } from "../app/config/app.config";
import { PostgresDatabase } from "../app/data/datasources/postgres.database";
import { InvalidArgumentsException } from "../app/common/exceptions/invalid-arguments.exception";
import { POSTGRES_SQL_CONNECTION_URL, POSTGRES_SQL_INVALID_CONNECTION_URL } from "./test.data";


const host = DB_HOST;

const username = DB_USERNAME;

const password = DB_PASSWORD;

const port = Number(DB_PORT);

const database = DB_NAME;

const connectionURL = POSTGRES_SQL_CONNECTION_URL;

const invalidConnectionURL = POSTGRES_SQL_INVALID_CONNECTION_URL;

describe("Tests PostgresSQLDatabase functionality", ()=>{

    it("Should correctly set connection parameters", ()=>{
        const postgresDB = new PostgresDatabase();
        postgresDB.setConnection(host, Number(port), username, database, password);
        expect(JSON.stringify(postgresDB.connectionURL)).to.equal(JSON.stringify({
            host,
            port: Number(port),
            user:username,
            database,
            password
        }));
    })

    it("Should throw invalid exception on invalid url connection", async()=>{
        const postgresDB = new PostgresDatabase();
        try{
           await postgresDB.connect();
        }catch(e){
            expect(e).to.be.instanceOf(InvalidArgumentsException);
        }
    })
})