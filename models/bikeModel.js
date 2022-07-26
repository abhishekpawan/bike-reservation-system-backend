const mongoose = require('mongoose')

const bikeSchema = mongoose.Schema({
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
    image:{
        type: Buffer,
        require:true
    }
},{
    timestamps:true
})

//setting up relation to the other collection
bikeSchema.virtual('bookedBike', {
    ref:'BookedBike',
    localField: '_id',
    foreignField: 'bikeId'
})

//setting up relation to the other collection
bikeSchema.virtual('review', {
    ref:'Review',
    localField: '_id',
    foreignField: 'bikeId'
})
module.exports = mongoose.model('Bike', bikeSchema)