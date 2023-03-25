// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql',
    connection: {
    host: "43.230.131.35",
    user: "aptumaac_book",
    password: "password2022",
    database: 'aptumaac_bookshelf',
    }
  }

};
