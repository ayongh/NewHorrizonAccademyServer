const router = require('express').Router();
const verify = require('../validation/verify_token')
const Class = require('../model/class_model');
const { check, validationResult } = require('express-validator');


/**
* @typedef createCourse
* @property {string} name.required 
* @property {string} description.required
* @property {string} tag.required
* @property {string} thumbnail.required
* @property {string} categorie.required
* @property {string} director.required
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /course/create
 * @group Course Create - creates class 
 * @param {createCourse.model} createCourse.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {LoginSucess.model} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/

const schema = 
[
    check('name').not().isEmpty().withMessage('name is required').isString().withMessage('Value can not be Number').escape(),
    check('description').not().isEmpty().withMessage('description is required').isString().withMessage('Value can not be Number').escape(),
    check('tag').not().isEmpty().withMessage('tag is required').isString().withMessage('Value can not be Number').escape(),
    check('thumbnail').not().isEmpty().withMessage('thumbnail is required').isString().withMessage('Value can not be Number').escape(),
    check('categorie').not().isEmpty().withMessage('categorie is required').isString().withMessage('Value can not be Number').escape(),
    check('director').not().isEmpty().withMessage('director is required').isString().withMessage('Value can not be Number').escape(),
]
router.post('/',schema,verify, async(req, res) =>{
    
    //Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) 
    {
        var payload = { 
            status:"Error",
            errorcode:422,
            errors: "Make sure all the info are filled"}
        return res.status(422).send(payload);
    }

    if(req.body.name === undefined)
    {
        return res.status(401).send({error:"please provide name "});

    }

    //Adds the data to the User Model
    const classModel = new Class({
        name: req.body.name,
        description: req.body.description,
        tag: req.body.tag,
        thumbnail: req.body.thumbnail,
        categorie:req.body.categorie,
        director: req.body.director
    })

    const savedClass = await classModel.save();


    res.status(200).send({data:savedClass})
    
})

module.exports = router;
