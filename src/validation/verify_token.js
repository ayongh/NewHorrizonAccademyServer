const jwt = require('jsonwebtoken')
const User = require('../model/User_model');
var jwtDecode = require('jwt-decode');

var loger = require('../logger/logger');

module.exports = async function (req, res, next)
{
    var starttime = process.hrtime();

    if(req.headers.authorization === undefined)
    {
        return res.status(403).send({error : "undefined authorization token"})
    }
    
    const bearertoken = req.headers.authorization;
    const sliceToken = bearertoken.split(" ")
    const token = sliceToken[1]

    if (!token) {
        var payload = {
            error:'Access deniened'
        }
        loger.log(req,res,401,payload.error,payload,starttime)
        return res.status(401).send(payload)
    }

    try
    {

        var decodedToken = jwtDecode(token)
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

    }catch(err)
    {
        var payload = {
            error:'auth invalid Token'       
        }
        loger.log(req,res,500,err,payload,starttime)
        res.status(500).send({error: "invalid token access denied"})
    }

}