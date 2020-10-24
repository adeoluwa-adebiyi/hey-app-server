import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    return await knex.schema.createTable("app-user", async(tableBuilder: Knex.CreateTableBuilder)=>{
        tableBuilder.increments();
        tableBuilder.string("firstname");
        tableBuilder.string("lastname");
        tableBuilder.date("dob");
        tableBuilder.string("email").unique().notNullable();
        tableBuilder.string("passwordhash").nullable();

        await knex.raw("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO PUBLIC");
    });
}


export async function down(knex: Knex): Promise<void> {
    return await knex.schema.dropTableIfExists("app-user");
}