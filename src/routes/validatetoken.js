const router = require('express').Router();
const jwt = require('jsonwebtoken');
const verify = require('../validation/verify_token')

  
router.get('/',verify, async (req, res) =>
{
    res.status(200).send({
        message: "token is valid"
    })
});


module.exports = router;