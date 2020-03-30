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
    },

    like:
    {
        required: false,
        type: Array
    },
    dislike:
    {
        required: false,
        type: Array
    }

});

module.exports = mongoose.model('Class',ClassSchema)