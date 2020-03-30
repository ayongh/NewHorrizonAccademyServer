const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    classID:
    {
        type:String,
        required:true,
    },
    name:
    {
        type:String,
        required: true,
    },

    description:
    {
        type: String,
        required: true
    },
    
    thumbnail:
    {
        type: String,
        required: true
    },

    season:
    {
        type: Number,
        required: true
    },

    episode:
    {
        type: Number,
        required: true
    },

    videoUrl:
    {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Section',sectionSchema)