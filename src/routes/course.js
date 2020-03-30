const router = require('express').Router();
const verify = require('../validation/verify_token')
const Class = require('../model/class_model');
const Section = require('../model/show_episode')



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

    const Course = await Class.find({$or : [{name: new RegExp(categorieinfo, 'i')}, {categorie: new RegExp(categorieinfo, 'i')}]})

    res.status(200).send({data:Course})
    
})




module.exports = router;