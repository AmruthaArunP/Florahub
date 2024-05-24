const mongoose = require("mongoose")

var schema = new mongoose.Schema({

   
    product_name: {
        type: String,
        required: true,
        
    },
    product_details: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    categoryID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl:[{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required:true
        }
    }],
    stock:{
        type:Number,
        // required:true
    },

    isOnCart:{
        type:Boolean,
        default:false
    },

    isWishlisted:{
        type:Boolean,
        default:false
    },

})
module.exports= mongoose.model("productCollection", schema)

