import { expect, assert } from "chai";
import { InvalidConnectionURLException } from "../app/common/exceptions/invalid-connection-url.exception";
import { KnexClient, KnexSqlDatabase } from "../app/data/datasources/knexsql.database";
import { KNEX_SQL_CONNECTION_URL, KNEX_SQL_INVALID_CONNECTION_URL } from "./test.data"

const connectionURl = KNEX_SQL_CONNECTION_URL;

const invalidConnectionURL = KNEX_SQL_INVALID_CONNECTION_URL;

describe("Tests KnexSqlDatabase functionality", ()=>{

    it("Should correctly set connection parameters", ()=>{
        const knexDB = new KnexSqlDatabase(KnexClient.SQLITE3);
        knexDB.setConnection(connectionURl);
        expect(knexDB.connectionURL).to.equal(connectionURl);
    });

    it("Should throw invalid exception on invalid url connection", async()=>{
        const knexDB = new KnexSqlDatabase(KnexClient.SQLITE3);
        knexDB.setConnection(invalidConnectionURL);
        try{
            await knexDB.connect();
        }catch(e){
            expect(e).to.be.instanceOf(InvalidConnectionURLException);
        }
    });
})