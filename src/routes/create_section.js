const router = require('express').Router();
const Section = require('../model/show_episode');

/**
* @typedef createSection
* @property {string} classID.required 
* @property {string} name.required
* @property {string} description.required
* @property {string} thumbnail.required
* @property {string} season.required
* @property {string} episode.required
* @property {string} videoUrl.required
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /section/create
 * @group Course Create - creates Section 
 * @param {createSection.model} createSection.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {LoginSucess.model} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/

router.post('/create', async(req, res) =>{

    //Adds the data to the User Model
    const sectionModel = new Section({
        classID:"5e388595464cb44e900b11bf",
        name: "something",
        description: "description of something",
        thumbnail:"urk",
        season:1,
        episode:2,
        videoUrl:"video url"
    })

    const savedSection = await sectionModel.save();


    res.status(200).send({data:savedSection})
    
})

module.exports = router;