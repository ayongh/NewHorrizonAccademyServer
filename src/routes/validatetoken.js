const router = require('express').Router();
const jwt = require('jsonwebtoken');
const verify = require('../validation/verify_token')
const verifyPswd = require('../validation/verify_pswdReset_token')
  
router.get('/',verify, async (req, res) =>
{
    res.status(200).send({
        message: "token is valid"
    })
});

router.get('/password',verifyPswd, async (req, res) =>
{
    res.status(200).send({
        message: "token is valid"
    })
});



module.exports = router;