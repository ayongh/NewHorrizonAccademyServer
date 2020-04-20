const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');

const Class = require('../model/class_model');


router.post('/content',verify, async(req, res) =>{

    const similarClass = await Class.find().limit(5)

    if(similarClass.length<0)
    {
        return res.status(400).send({error:"error when finding similar class"})
    }

    res.status(200).send({message: similarClass})
})

router.post('/collaborative',verify, async(req, res) =>{

    const similarClass = await Class.find().limit(15)

    if(similarClass.length<0)
    {
        return res.status(400).send({error:"error when finding similar class"})
    }

    res.status(200).send({mainContent:similarClass[0],message: similarClass.slice(1)})
      
})

module.exports = router;