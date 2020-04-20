const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');
const Class = require('../model/class_model');



router.get('/create',verify, async(req, res) =>{

    //Adds the data to the User Model
    const classModel = new Class({
        name: "Test Data",
        description: "Something about the Test data",
        thumbnail: "https://drive.google.com/uc?id=1eO2vzGAsQRrzcKVxkoXixK1z5uEyQ8ir",
        categorie:"movie",
        director: "Abhishek Yonghang",
        actors:"Abhishek, john"
    })

    const savedClass = await classModel.save();


    res.status(200).send({data:savedClass})
    
})

router.post('/updateLike/:classID',verify, async(req, res) =>{

    
    res.status(200).send({data:"a"})
    
})

module.exports = router;
