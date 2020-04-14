const router = require('express').Router();
var path = require('path');

router.get('/', async(req, res) =>{
    res.sendFile(path.join(__dirname+'/Index.html'))
})

module.exports = router;