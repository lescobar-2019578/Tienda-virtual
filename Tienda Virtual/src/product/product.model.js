import { Schema, model } from "mongoose"

const productSchema = Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    tradeMark: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        require: true
    },
    category: {
        type: Schema.Types.ObjectId,  //referencia a un documento de la colección Category
        ref: 'category',
        require: true 
    }
},{
    versionKey: false
})

//pre mongoose
                            //pluralizar
export default model('product', productSchema)