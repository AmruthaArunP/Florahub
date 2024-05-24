const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    code:{
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        require: true
    },

    discount:{
        type:Number,
        required:true,
        min: 0,
        max: 100
    },

    minDiscount:{
        type: Number,
        required:true,
        default: 0
    },

    maxDiscount:{
        type: Number,
        required:true,
        default: 0
    },

    expiryDate:{
        type:Date,
        required: true
    },

    status:{
        type:Boolean,
        default: true
    },

    usedBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

module.exports = mongoose.model('Offer', orderSchema)