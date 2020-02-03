const router = require('express').Router();
const verify = require('../validation/verify_token')

router.get('/all',verify, (req, res) =>{

    res.status(200).send({message:"Successfully called Home Route",cookie:req.cookies})
    
})


router.get('/recomended',verify, (req, res) =>{

    res.status(200).send({message:"Successfully called Recomended",cookie:req.cookies})
    
})


router.get('/categoriecal/:categorie',verify, (req, res) =>{

    res.status(200).send({message:"Successfully called Categorical",cookie:req.cookies})
    
})


router.get('/search/:serchContext',verify, (req, res) =>{

    res.status(200).send({message:"Successfully called Search",cookie:req.cookies})
    
})





module.exports = router;