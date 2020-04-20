const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userID:
    {
        type:String,
        required:true,
    },

    classID:
    {
        type:String,
        required: true,
    },

    rating:
    {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('rating',ratingSchema)