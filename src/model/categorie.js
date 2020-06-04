const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
    categorie:
    {
        type:String,
        required:true,
    }
});

module.exports = mongoose.model('categorie',categorieSchema)