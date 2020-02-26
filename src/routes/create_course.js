const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');
const Class = require('../model/class_model');



router.get('/create',verify, async(req, res) =>{

    //Adds the data to the User Model
    const classModel = new Class({
        name: req.body.name,
        description: req.body.description,
        thumbnail: req.body.thumbnail,
        like: req.body.like
    })

    const savedClass = await classModel.save();


    res.status(200).send({data:savedClass})
    
})

router.post('/updateLike/:classID',verify, async(req, res) =>{

    
    res.status(200).send({data:"a"})
    
})

module.exports = router;
