const Joi      = require("@hapi/joi")
const {Model}  = require("objection")
const db       = require("../config")
Model.knex(db)

class BookData extends Model {
    static get tableName(){
        return "bookshelf"
    }

    static get JoiSchema(){
        return Joi.object({
            id:Joi.string(),
            name:Joi.string(),
            year:Joi.number(),
            author:Joi.string(),
            summary:Joi.string(),
            publisher:Joi.string(),
            pageCount:Joi.number().integer(),
            readPage:Joi.number().integer(),
            finished:Joi.boolean(),
            reading:Joi.boolean(),
            insertedAt:Joi.date(),
            updatedA:Joi.date()

        })
    }
}

module.exports=BookData