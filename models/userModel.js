const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name'],
        trim:true,

    },
    email:{
        type: String,
        required: [true, 'Please add an email'],
        trim:true,
        unique: true
    },
    password:{
        type: String,
        required: [true, 'Please add a password'],
        trim:true,
    },
    role:{
        type: String,
        required: [true, 'Please add a role'],
        trim:true,
    }
},
{
    timestamps:true
})

//filtering user data to hide private things (password, token,etc)
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    
    return userObject
}
//setting up relation to the other collection
userSchema.virtual('bookedBike', {
    ref:'BookedBike',
    localField: '_id',
    foreignField: 'bookedBy'
})
//setting up relation to the other collection
userSchema.virtual('review', {
    ref:'Review',
    localField: '_id',
    foreignField: 'userId'
})


// Delete user's tasks when user is removed
// userSchema.pre('remove', async function(next){
//     const user = this
//     await Task.deleteMany({owner: user._id})
//     next()
// })

module.exports = mongoose.model('User', userSchema)