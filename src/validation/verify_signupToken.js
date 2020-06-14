const jwt = require('jsonwebtoken')

module.exports = function (req, res, next)
{
    const bearertoken = req.headers.authorization;
    const sliceToken = bearertoken.split(" ")
    const token = sliceToken[1]

    if (!token) return res.status(401).send({error:'Access deniened'})

    //Then Checks the cookie called signup to validate the secret key initiated in the /emailverification
    if(token=== undefined)
    {
        var payload = 
        {
            errors:"signup cookie is not available", 
            errorcode:400
        }

        loger.log(req,res,400,payload.errors,payload,starttime)
        return res.status(400).send(payload)
    }

    try
    {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    }catch(err)
    {
        res.status(400).send({error:'invalid signup Token'})
    }

}