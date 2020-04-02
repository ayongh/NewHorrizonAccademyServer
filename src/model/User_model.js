const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName:
    {
        type:String,
        required:true,
        max:100
    },
    lastName:
    {
        type:String,
        required: true,
        max: 100
    },

    email:
    {
        type: String,
        required: true,
        max: 500
    },
    
    password:
    {
        type: String,
        required: true,
        min: 8,
        max: 20
    },

    watchHistory:
    {
        type:Array,
        default:[]
    },

    like:
    {
        type:Array,
        default:[]
    },

    dislike:
    {
        type:Array,
        default:[]
    },

    date:
    {
        type:Date,
        default: Date.now
    }


});

module.exports = mongoose.model('User',UserSchema)