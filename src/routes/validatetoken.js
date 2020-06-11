const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../model/User_model');

var jwtDecode = require('jwt-decode');
const verify = require('../validation/verify_token')
const verifyPswd = require('../validation/verify_pswdReset_token')
  
router.get('/',verify, async (req, res) =>
{
    if(req.headers.authorization === undefined)
    {
        return res.status(403).send({error : "undefined authorization token"})
    }

    const bearertoken = req.headers.authorization;
    const sliceToken = bearertoken.split(" ")

    const token = sliceToken[1]    

    var decodedToken = jwtDecode(token)
    var userID = decodedToken._id

    const user = await User.findOne({_id:userID})
    
    if(!user)
    {
        res.status(404).send({
            error:"User cannot found"     
        })
    }

    res.status(200).send({
        message: user
    })
});

router.get('/password',verifyPswd, async (req, res) =>
{
    res.status(200).send({
        message: "token is valid"
    })
});



module.exports = router;