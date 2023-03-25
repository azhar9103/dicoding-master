const connection = require("./knex")["development"]
const knex       = require("knex")(connection)

module.exports=knex;
