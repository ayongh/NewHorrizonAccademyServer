const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');

const Class = require('../model/class_model');
const Section = require('../model/show_episode')
const User = require('../model/User_model');
const Rating = require('../model/rating_model')


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

    var ratingExist = await Rating.findOne({userID:user._id, classID:classID})

    console.log(ratingExist)
    var RatingMovieRes ="";

    if(ratingExist === null)
    {
        var RatingMovie = new Rating({
            userID: user._id,
            classID: classID,
            rating: 1 
        })
        RatingMovieRes = await RatingMovie.save();
    }else
    {
        if(ratingExist.rating<0)
        {
            var query = {"userID":user._id, "classID":classID}
            var data = { "rating" : 1 }
            RatingMovieRes = await Rating.updateOne(query,{ $set:data });
        }
        else
        {
           return res.status(404).send({error:"user already liked the movie"})
        }

    }

    res.status(200).send({message:RatingMovieRes, status:"like" })    
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

    var ratingExist = await Rating.findOne({userID:user._id, classID:classID})

    var RatingMovieRes ="";

    if(ratingExist === null)
    {
        var RatingMovie = new Rating({
            userID: user._id,
            classID: classID,
            rating: -1 
        })
        RatingMovieRes = await RatingMovie.save();
    }else
    {
        if(ratingExist.rating>0)
        {
            var query = {"userID":user._id, "classID":classID}
            var data = { "rating" : -1 }
            RatingMovieRes = await Rating.updateOne(query,{ $set:data });
        }
        else
        {
           return res.status(404).send({error:"user already disliked the movie"})
        }

    }

    res.status(200).send({message:RatingMovieRes, status:"dislike" })    
    
})


router.get('/listrating',verify, async(req, res) =>{

    var token = req.cookies.authToken;

    var decoded = jwtDecode(token);

    const user = await User.findOne({_id:decoded._id})
    
    if(!user)
    {
        return res.status(404).send({error: "User not found "})
    }

    var ratingExist = await Rating.find({userID:user._id})

    if(ratingExist.length <= 0)
    {
        return res.status(404).send({error: "No rating found"})
    }

    res.status(200).send({message: ratingExist})
})


module.exports = router;