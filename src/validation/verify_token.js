const jwt = require('jsonwebtoken')
const User = require('../model/User_model');
var jwtDecode = require('jwt-decode');

var loger = require('../logger/logger');

module.exports = async function (req, res, next)
{

    console.log(req.headers)

    var starttime = process.hrtime();

    var bearerToken;
    var bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        
    } else {
        return res.status(403).send({error:"Authentication Token is not defined"});
    }

    console.log(bearerToken)
    const token = bearerToken;

    try
    {

        var decodedToken = await jwtDecode(token)
       
    }catch(err)
    {
        var payload = {
            error:'auth invalid Token'       
        }
        loger.log(req,res,500,err,payload,starttime)
        return res.status(500).send({error:"internal critical error"})
    }

    var userID = decodedToken._id
    
    const user = await User.findOne({_id:userID})
    
    if(!user)
    {
        var payload = {
            error:"User cannot found"     
        }
        loger.log(req,res,404,payload.error,payload,starttime)
        return res.status(404).send(payload)
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET)
    req.user = verified
    next()

}