const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    review:{
        type:String,
        default:true,
        required:true,
    },
    avgRating:{
        type:Number,
        default:0,
        trim:true,
    },
    bikeId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Bike'
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
},{
    timestamps:true
})


module.exports = mongoose.model('Review', reviewSchema)