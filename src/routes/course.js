const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');

const Class = require('../model/class_model');
const Section = require('../model/show_episode')
const User = require('../model/User_model');



router.get('/all',verify, async(req, res) =>{

    const allClass = await Class.find()
    res.status(200).send({classes:allClass})
    
})

router.get('/recomended',verify, async (req, res) =>{

    const recommendedClass = await Class.find().limit(3).skip(0)
    res.status(200).send({data:recommendedClass})
    
})


router.get('/similar',verify, async (req, res) =>{

    const recommendedClass = await Class.find().limit(3).skip(0)
    res.status(200).send({data:recommendedClass})
    
})


router.get('/findSection/:classID',verify, async (req, res) =>{

    const classInfo = req.params.classID

    const SectionInfo = await Section.find({classID:classInfo})

    console.log(SectionInfo)

    res.status(200).send({data: SectionInfo})
    
})


router.get('/searchCourse/:categorie',verify, async(req, res) =>{

    const categorieinfo = req.params.categorie

    const Course = await Class.find({categorie: new RegExp(categorieinfo, 'i') }).limit(10).skip(0)

    res.status(200).send({data:Course})
    
})

router.get('/search/:content',verify, async(req, res) =>{

    const categorieinfo = req.params.content

    const Course = await Class.find({$or : [{name: new RegExp(categorieinfo, 'i')}, {tag: new RegExp(categorieinfo, 'i')},{description: new RegExp(categorieinfo, 'i')} ]})

    res.status(200).send({data:Course})
    
})


router.post('/like',verify, async(req, res) =>{

    const classID = req.body.classID
    var token = req.cookies.authToken;

    var decoded = jwtDecode(token);

    if(classID === null || classID === undefined)
    {
        return res.status(400).send({error: "make sure you send classID"})
    }

    const user = await User.findOne({_id:decoded._id})
    
    if(!user)
    {
        return res.status(404).send({error: "User not found "})
    }

    var currentUserLike = user.like

    if(currentUserLike !== undefined){

        for(var i = 0; i<= currentUserLike.length; i++)
        {
            if( currentUserLike[i] === classID)
            {
                return res.status(400).send({error: "Class ID is already liked by user"})
                break
            }
        }
    }


    currentUserLike.push(classID)

    const updatedLIkeuser = await User.updateOne({_id:decoded._id}, {like: currentUserLike})

    const Newuser = await User.findOne({_id:decoded._id})
    res.status(200).send({data:Newuser})
    
})

router.post('/dislike',verify, async(req, res) =>{

    const classID = req.body.classID
    var token = req.cookies.authToken;

    var decoded = jwtDecode(token);

    if(classID === null || classID === undefined)
    {
        return res.status(400).send({error: "make sure you send classID"})
    }

    const user = await User.findOne({_id:decoded._id})
    
    if(!user)
    {
        return res.status(404).send({error: "User not found "})
    }

    var currentUserdisLike = user.dislike

    if(currentUserdisLike !== undefined){

        for(var i = 0; i<= currentUserdisLike.length; i++)
        {
            if( currentUserdisLike[i] === classID)
            {
                return res.status(400).send({error: "Class ID is already liked by user"})
                break
            }
        }
    }


    currentUserdisLike.push(classID)

    const updatedLIkeuser = await User.updateOne({_id:decoded._id}, {dislike: currentUserdisLike})

    const Newuser = await User.findOne({_id:decoded._id})

    res.status(200).send({data:Newuser})
    
})







module.exports = router;