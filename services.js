const BookData = require("./model/joi")
const vali     = require("joi")

class Book{
    async insertDetail(req,h){
        const{id,name,year,author,summary,publisher,pageCount,readPage,finished,reading,insertedAt,updatedAt}=req.payload

        try {
            await BookData.query().insert(req.payload)
            return h.response('bookshelf inserted')
            
        } catch (error) {
           return h.response(err.message) 
        }
    }
    async getData(req,h){
        try {
            const data = await  BookData.query()
            console.log(data);
            return h.response(data)
        } catch (error) {
            return h.respose(err.message) 
        }
    }
    async updateData(req,h){
        const{id,name,year,author,summary,publisher,pageCount,readPage,finished,reading,insertedAt,updatedAt}=req.payload

        try {
            const data = await  BookData.query().select('*').from('bookshelf').where('id',req.params.id).update(req.payload)
            console.log(data);
            return h.response(data)
        } catch (error) {
            return h.respose(err.message) 
        }
    }
    async deleteData(req,h){
        try {
            const data = await  BookData.query().deleteById(req.params.id)
            console.log(data);
            return h.response(data)
        } catch (error) {
            return h.respose(err.message) 
        }
    }
    async getDataById(req,h){
        try {
            const data = await  BookData.query().where('id',req.params.id)
            console.log(data);
            return h.response(data)
        } catch (error) {
            return h.respose(err.message) 
        }
    }
}

module.exports=Book