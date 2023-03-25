const hapi      = require("@hapi/hapi")
const joi       = require('@hapi/joi');
const book      = require("./services")
const router    = new book();

const init = async()=>{
    const server= hapi.server({
        port:3030,
        host:'localhost'
    })

    server.route({
        method:'GET',
        path:'/books',
        handler:router.getData   
    });

    server.route({
        method:'GET',
        path:'/data/{id}',
        handler:router.getDataById
        
    });

    server.route({
        method:"POST",
        path:"/insert",
        options: {
            validate: {
              payload: joi.object({
                id:joi.string(),
                name:joi.string(),
                year:joi.number(),
                author:joi.string(),
                summary:joi.string(),
                publisher:joi.string(),
                pageCount:joi.number().integer(),
                readPage:joi.number().integer(),
                finished:joi.boolean(),
                reading:joi.boolean(),
                insertedAt:joi.date(),
                updatedA:joi.date()
              }),
            },
        handler:router.insertDetail
        }
        
    });

    server.route({
        method:'PUT',
        path:'/update/{id}',
        options: {
            validate: {
              payload: joi.object({
                    id:joi.string(),
                    name:joi.string(),
                    year:joi.number(),
                    author:joi.string(),
                    summary:joi.string(),
                    publisher:joi.string(),
                    pageCount:joi.number().integer(),
                    readPage:joi.number().integer(),
                    finished:joi.boolean(),
                    reading:joi.boolean(),
                    insertedAt:joi.date(),
                    updatedA:joi.date()
              }),
            },
        handler:router.updateData
        }
        
    });
    
    server.route({
        method:'DELETE',
        path:'/delete/{id}',
        handler:router.deleteData
        
    });    

    await server.start();
    console.log("server running on",server.info.uri);
};

process.on('unhandledRejection',(err)=>{
    console.log(err);
})

init();