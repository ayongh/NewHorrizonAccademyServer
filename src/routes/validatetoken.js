const router = require('express').Router();
const jwt = require('jsonwebtoken');
const verify = require('../validation/verify_token')

  
router.post('/',verify, async (req, res) =>
{
    const bodyToken = req.body.localtoken
    const token = req.cookies.authToken;

    if(bodyToken == token)
    {
        res.status(200).send({login:true})

    }
    else
    {
        res.status(400).send({login:false})
    }
});


module.exports = router;