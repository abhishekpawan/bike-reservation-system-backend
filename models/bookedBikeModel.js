const mongoose = require('mongoose')

const bookedBikeSchema = mongoose.Schema({
    model:{
        type:String,
        required:true,
        trim:true
    },
    color:{
        type:String,
        required:true,
        trim:true
    },
    isAvailable:{
        type:Boolean,
        default:true,
        required:true,
    },
    avgRating:{
        type:Number,
        default:0,
        trim:true,
    },
    location:{
        type:String,
        require:true,
        trim:true,
    },
    bookingStatus:{
        type:String,
        trim:true
    },
    bikeId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Bike'
    },
    bookedBy:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    image:{
        type: Buffer
    }
},{
    timestamps:true
})

module.exports = mongoose.model('BookedBike', bookedBikeSchema)