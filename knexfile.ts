import {DB_URI} from "./app/config/app.config";
import path from "path";
require('ts-node/register');
import { KnexClient } from "./app/data/datasources/knexsql.database";

module.exports = {
    development: {
      client: KnexClient.POSTGRESQL,
      connection: DB_URI,
      migrations: {
        directory: path.resolve("./app/data/migrations"),
      },
      seeds:{
          directory: path.resolve("./app/data/seeds")
      }
    },
};