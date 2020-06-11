const router = require('express').Router();
const verify = require('../validation/verify_token')
const Class = require('../model/class_model');
const Rating = require('../model/rating_model')
const User = require('../model/User_model')

var jwtDecode = require('jwt-decode');

/**
* @typedef class
* @property {string} name.required 
* @property {string} description.required
* @property {string} tag.required
* @property {string} thumbnail.required
* @property {string} categorie.required
* @property {string} director.required
*/

/**
* @typedef popularQuery
* @property {integer} pagination.required 
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /render/class/popular
 * @param {popularQuery.model} popularQuery.body.required - insert class ID in the URL
 * @group class render - route to render class
 * @produces application/json 
 * @consumes application/json
 * @returns {Array<class>} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/

router.post('/popular',verify, async(req, res) =>{

    var pagination;

    if(req.body.pagination === undefined)
    {
        pagination = 10
    }
    else
    {
        pagination = req.body.pagination
    }

    Rating.aggregate([ {$group : {_id : "$classID", count : {$sum : 1}}} ], async function(err, ratings) {
       
        if(err)
        {
            return res.status(403).send({error: "Failuter to group and count top class"})
        }

        function compare(a,b)
        {
            if(a.count>b.count) return -1
            if(b.count> a.count) return 1

            return 0
        }
        
        var sortedrating= ratings.sort(compare)

        var classes = await Class.find().where('_id').in(sortedrating.slice(0,pagination)).exec()

        if(!classes)
        {
            return res.status(403).send({error:"Failure to find top 10 classes"})
        }

        return res.status(200).send(classes)
    });
})

/**
* @typedef popularQuery
* @property {integer} pagination.required 
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /render/class/newlyadded
 * @param {popularQuery.model} popularQuery.body.required - insert class ID in the URL
 * @group class render - route to render class
 * @produces application/json 
 * @consumes application/json
 * @returns {Array<class>} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/

router.post('/newlyadded',verify, async(req, res) =>{

    var pagination;

    if(req.body.pagination === undefined)
    {
        pagination = 10
    }
    else
    {
        pagination = req.body.pagination
    }

    Class.find({}).sort({date:-1}).exec(function(err, result){
        if(err)
        {
            return res.status(403).send({error:"error occure when finding the newlyadded video"})
        }

        return res.status(200).send(result)
    })
})


/**
* @typedef popularQuery
* @property {integer} pagination.required 
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /render/class/watchHistory
 * @param {popularQuery.model} popularQuery.body.required - insert class ID in the URL
 * @group class render - route to render class
 * @produces application/json 
 * @consumes application/json
 * @returns {Array<class>} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/

router.post('/watchHistory',verify, async(req, res) =>{

    var pagination;

    if(req.body.pagination === undefined)
    {
        pagination = 10
    }
    else
    {
        pagination = req.body.pagination
    }

    const bearertoken = req.headers.authorization;

    const sliceToken = bearertoken.split(" ")

    const token = sliceToken[1]    
    
    var decodedToken = jwtDecode(token)
    var userID = decodedToken._id

    var query = {_id:userID}
    const user = await User.findOne(query)
    
    if(!user)
    {
        return res.status(403).send({error:"No such user found"})
    }

    var watchHistort = user.watchHistory

    var classes = await Class.find({}).where('_id').in(watchHistort).exec()

    res.status(200).send({classes})
})



/**
* @typedef categorieTypeQuery
* @property {string} categorie.required 
* @property {integer} pagination.required 
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /render/class/categorie
 * @param {categorieTypeQuery.model} categorieTypeQuery.body.required - insert class ID in the URL
 * @group class render - route to render class
 * @produces application/json 
 * @consumes application/json
 * @returns {Array<class>} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/

router.post('/categorie',verify, async(req, res) =>{

    if(req.body.categorie === undefined)
    {
        return res.status(403).send({error:"Please provide categorie"})
    }

    var pagination;

    if(req.body.pagination === undefined)
    {
        pagination = 20
    }
    else
    {
        pagination = req.body.pagination
    }
    
    Rating.aggregate([{$group : {_id : "$classID", count : {$sum : 1}}}], async function(err, ratings) 
    {
       
        if(err)
        {
            return res.status(403).send({error: "Failuter to group and count top class"})
        }

        function compare(a,b)
        {
            if(a.count>b.count) return -1
            if(b.count> a.count) return 1

            return 0
        }
        
        var sortedrating= ratings.sort(compare)

        var classes = await Class.find({categorie: req.body.categorie}).where('_id').in(sortedrating).exec()

        if(!classes)
        {
            return res.status(403).send({error:"Failure to find top classes"})
        }

        return res.status(200).send(classes.slice(0,pagination))
    });
})

module.exports = router;
