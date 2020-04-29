const router = require('express').Router();
const verify = require('../validation/verify_token')
var jwtDecode = require('jwt-decode');

const Class = require('../model/class_model');
const Section = require('../model/show_episode')
const User = require('../model/User_model');
const Rating = require('../model/rating_model')

var loger = require('../logger/logger');

/**
* @typedef class
* @property {string} id 
* @property {string} name
* @property {string} tag
* @property {string} thumbnail
* @property {string} categorie
* @property {string} description
* @property {string} director
* @property {string} actors
*/

/**
* This route will validate the email and returns a cookie with fname, lname, email and password to be added in the user collection.
* @route get /course/all
* @group Course Read Action - Adds user to the collection using multiple routes
* @produces application/json
* @consumes application/json
* @returns {Array.<class>} 200 - Returns the signupEmailVerificationSucessResult model and cookie to signup
* @security JWT
*/
router.get('/all',verify, async(req, res) =>{
    var starttime = process.hrtime();

   try {
        const allClass = await Class.find()
        var payload = 
        {
            classes:allClass
        }
        loger.log(req,res,200,"sucessfully returned list of class", payload,starttime)
        res.status(200).send(payload)
   } 
   catch (error) 
   {
       var payload= {
            error:error
       }
        loger.log(req,res,500,error, payload,starttime)
        res.status(500).send(payload)
   }
    
})


/**
* This route will validate the email and returns a cookie with fname, lname, email and password to be added in the user collection.
* @route get /course/findSection/:classID
* @param {string} classID.query.required - insert class ID in the URL
* @group Course Read Action - Adds user to the collection using multiple routes
* @produces application/json
* @consumes application/json
* @returns {Array.<class>} 200 - Returns the signupEmailVerificationSucessResult model and cookie to signup
*/
router.get('/findSection/:classID',verify, async (req, res) =>{

    var starttime = process.hrtime();

    const classInfo = req.params.classID

    if(classInfo === undefined)
    {
        var payload =
        {
            error: "Require class ID to retrive the section of class"
        }
        loger.log(req,res,403,payload.error, payload,starttime)
        return res.status(403).send(payload)
    }

    try {
        const SectionInfo = await Section.find({classID:classInfo})
    
        if(!SectionInfo)
        {
            var payload = {
                error: "Error occured when finding section"
            }
            loger.log(req,res,403,payload.error, payload,starttime)
            return res.status(403).send(payload)
        }

        var payload={
            data: SectionInfo
        }
        loger.log(req,res,200,"Successfully found the section", payload,starttime)
        res.status(200).send(payload)

    } catch (error) {
        var payload={
            data: SectionInfo
        }
        loger.log(req,res,500,error, payload,starttime)
        res.status(500).send(payload)
    }

    
})


router.get('/searchCourse/:categorie',verify, async(req, res) =>{

    var starttime = process.hrtime();

    const categorieinfo = req.params.categorie

    const Course = await Class.find({categorie: new RegExp(categorieinfo, 'i') }).limit(10).skip(0)

    var payload={
        data:Course
    }
    loger.log(req,res,200,"Successfully found Course", payload,starttime)
    res.status(200).send(payload)
    
})

router.get('/search/:content',verify, async(req, res) =>{

    var starttime = process.hrtime();

    const categorieinfo = req.params.content

    const Course = await Class.find({$or : [{name: new RegExp(categorieinfo, 'i')}, {tag: new RegExp(categorieinfo, 'i')},{description: new RegExp(categorieinfo, 'i')} ]})

    var payload =
    {
        data:Course
    }

    loger.log(req,res,200,"Successfully searched Course", payload,starttime)
    res.status(200).send(payload)
    
})

/**
* @typedef likeBody
* @property {string} classID 
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /course/like
 * @group Course Read Action - Adds user to the collection using multiple routes
 * @param {likeBody.model} LoginCredentials.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {LoginSucess.model} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/
router.post('/like',verify, async(req, res) =>{
    var starttime = process.hrtime();

    const classID = req.body.classID
    var token = req.cookies.authToken;

    var decoded = jwtDecode(token);

    if(classID === null || classID === undefined)
    {
        var payload={error: "make sure you send classID"}

        loger.log(req,res,400,payload.error, payload,starttime)
        return res.status(400).send(payload)
    }

    const classfind  = await Class.findOne({_id:classID})

    if(!classfind)
    {   
        var payload = {error: "class ID doesnt exist"}
        loger.log(req,res,403,payload.error, payload,starttime)
        return res.status(403).send(payload)
    }

    const user = await User.findOne({_id:decoded._id})
    
    if(!user)
    {
        var payload = {error: "User not found "}
        loger.log(req,res,404,payload.error, payload,starttime)
        return res.status(404).send(payload)
    }

    var ratingExist = await Rating.findOne({userID:user._id, classID:classID})

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
            var payload = {error:"user already liked the movie"}
            loger.log(req,res,404,payload.error, payload,starttime)
            return res.status(404).send(payload)
        }

    }

    var payload = {message:RatingMovieRes, status:"like" }
    loger.log(req,res,200,"Sucessfully liked a class", payload,starttime)
    res.status(200).send()    
})

/**
* @typedef likeBody
* @property {string} classID 
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /course/like/remove
 * @group Course Read Action - Adds user to the collection using multiple routes
 * @param {likeBody.model} LoginCredentials.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {LoginSucess.model} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/
router.post('/like/remove',verify, async(req, res) =>{

    var starttime = process.hrtime();

    const classID = req.body.classID
    var token = req.cookies.authToken;

    var decoded = jwtDecode(token);

    if(classID === null || classID === undefined)
    {
        var payload ={error: "make sure you send classID"}
        loger.log(req,res,400,payload.error, payload,starttime)
        return res.status(400).send(payload)
    }

    const user = await User.findOne({_id:decoded._id})
    
    if(!user)
    {
        var payload= {error: "User not found "}
        loger.log(req,res,404,payload.error, payload,starttime)
        return res.status(404).send(payload)
    }

    var ratingExist = await Rating.deleteOne({userID:user._id, classID:classID})

    if(!ratingExist )
    {
        var payload = {error: "error occure deleting the like"}
        loger.log(req,res,404,payload.error, payload,starttime)
        return res.status(404).send(payload)
    }

    payload = {message:ratingExist}
    loger.log(req,res,404,"Sucessfully removed a rating", payload,starttime)
    res.status(200).send(payload)    
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


/**
* @typedef Rating
* @property {string} ID 
* @property {string} classID 
* @property {string} userID 
* @property {integer} rating 
*/

/**
 * This function comment is parsed by doctrine
 * @route GET /course/listrating
 * @group Course Read Action - Adds user to the collection using multiple routes
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {Array.<Rating>} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/
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