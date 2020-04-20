const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name:
    {
        type:String,
        required:true,
    },
    description:
    {
        type:String,
        required: true,
    },
    tag:
    {
        type:String,
    },

    thumbnail:
    {
        type: String,
        required: true,
    },
    
    categorie:
    {
        type: String,
        required: true,
    },
    director:
    {
        type: String,
        required: true,
    },
    actors:
    {
        type: String,
        required: true,
    }

});

module.exports = mongoose.model('Class',ClassSchema)