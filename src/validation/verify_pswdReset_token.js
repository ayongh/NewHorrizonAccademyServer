const jwt = require('jsonwebtoken')

module.exports = function (req, res, next)
{
    const token = req.cookies.pswdreset;

    if (!token) return res.status(401).send({error:'Access deniened'})

    try
    {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    }catch(err)
    {
        res.status(400).send({error:'invalid Token'})
    }

}