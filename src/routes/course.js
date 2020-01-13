const router = require('express').Router();
const verify = require('../validation/verify_token')

router.get('/all',verify, (req, res) =>{
    res.status(200).send({message:"Successfully called Home Route"})
})


module.exports = router;