const router = require('express').Router();
const User = require('../model/User_model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//validation
const { check, validationResult } = require('express-validator');


//Validation middle ware
const schema = 
[
    check('email').not().isEmpty().withMessage('Email is required').isString().withMessage('Value can not be Number').escape().isEmail().withMessage('Invalid Email address'),
    check('password').not().isEmpty().withMessage('password is required').isLength({ min: 8 }).withMessage('Invalid password, please review').isString().withMessage('Value can not be Number').escape().trim().matches(/\d/).withMessage('must contain a number')
]
  
router.post('/',schema, async (req, res) =>
{

    //Lets Validate the User data
    //Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) 
    {
        return res.status(422).json({ errors: "Make sure your username and password is correct"});
    }

    //Checking email exists
    const user = await User.findOne({email:req.body.email})
    if (!user) return res.status(404).send({
        status:"Error",
        code: 404,
        message:"user with email " + req.body.email +" doesn't exist"
    })

    //Checking Password and decryprting
    const validatePassword = await bcrypt.compare(req.body.password, user.password)
    if(!validatePassword) return res.status(404).send({
        status:"Error",
        code: 404,
        message:"user with email " + req.body.email +" password doesn't match"
    })


    //Create and assign web token
    const token  = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: "5 days"} )

    const cookieOptions = {
        httpOnly: true,
    }

    //Successfully loges in
    res.cookie('authToken', token, cookieOptions).status(200).send({
        status:"Sucess",
        code: 200,
        login: true,
        token: token,
        message:"Sucessfully logeed in"
    })

});


module.exports = router;