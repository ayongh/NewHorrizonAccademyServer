const router = require('express').Router();
const verify = require('../validation/verify_token')
const verifyRefresh = require('../validation/verify_refreshtoken')

router.get('/all',verify, verifyRefresh, (req, res) =>{
    res.status(200).send({message:"Successfully called Home Route"})
})


module.exports = router;