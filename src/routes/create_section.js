const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');
const Section = require('../model/show_episode');



router.get('/create', async(req, res) =>{

    //Adds the data to the User Model
    const sectionModel = new Section({
        classID:"5e388595464cb44e900b11bf",
        name: "something",
        description: "description of something",
        thumbnail:"urk",
        videoUrl:"video url"
    })

    const savedSection = await sectionModel.save();


    res.status(200).send({data:savedSection})
    
})

module.exports = router;