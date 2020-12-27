import "reflect-metadata";
import "./app/appregistry.registry";
import { seedDB } from "./seed_db";
import { container } from "tsyringe";

seedDB(container.resolve("DatabaseSpec")).then(()=>{
    console.log("Databse seeded");
});