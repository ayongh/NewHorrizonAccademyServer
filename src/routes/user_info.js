const router = require('express').Router();
const validate = require('../validation/verify_token')
const User = require('../model/User_model');

var speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var sendVerificationCode = require('../middle_ware/varification_email')

var verifyEmailToken = require('../validation/verify_updateEmail')
var jwtDecode = require('jwt-decode');

//validation
const { check, validationResult } = require('express-validator');


//Validation middle ware
const emailschema = 
[
    check('email').not().isEmpty().withMessage('Email is required').isString().withMessage('Value can not be Number').escape().isEmail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
          User.findOne({email:req.body.email}, function(err, user){
            if(err) {
              reject(new Error('Server Error'))
            }
            if(Boolean(user)) {
              reject(new Error(value + ' E-mail already in use'))
            }
            resolve(true)
          });
        });
      }),
]
  
router.post('/update/email',emailschema,validate, async (req, res) =>
{
    //Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) 
    {
        return res.status(422).json({ error: "Make sure your email is valid"});
    }

    //Generate random number 
    var secret = speakeasy.generateSecret({length: 5});

    const salt = await bcrypt.genSalt(10);
    const hashedSecret = await bcrypt.hash(secret.base32, salt)
    
    var payload = {
        email: req.body.email,
        authCode: hashedSecret
    }
 
    //Create and assign web token
    const token  = jwt.sign({data: payload}, process.env.TOKEN_SECRET,{expiresIn: 300})

    const cookieOptions = {
        httpOnly: true,
    }
 
    //Send email using node mailer
    sendVerificationCode.sendVarificationCode(secret.base32, req.body.email ,res)

    res.cookie('emailupdate',token, cookieOptions).status(200).send({
        message:"sucessfully validated"
    })
});

router.post('/update/emailValidation',verifyEmailToken,validate, async (req, res) =>
{
    var authToken = req.cookies.authToken;
    var decodedAuthToken = jwtDecode(authToken)
    var userID = decodedAuthToken._id


    var emailUpdateToken = req.cookies.emailupdate
    var decodedemailUpdateToken = jwtDecode(emailUpdateToken)

    var emailUpdateValidationKey = decodedemailUpdateToken.data.authCode
    var newUpdateEmail = decodedemailUpdateToken.data.email

    const validateKey = await bcrypt.compare(req.body.validationCode, emailUpdateValidationKey)

    if(!validateKey)
    {
        return res.status(403).send({
            error:"invalid validation key"
            
        })
    }

    var query = {_id: userID}
    var updateData = {'email': newUpdateEmail}
    
    
    const user = await User.updateOne(query, updateData)
    
    if(!user)
    {
        return res.status(403).send({
            error:"Error when updating Email"
        })
    }


    res.clearCookie('emailupdate').status(200).send({
        message:newUpdateEmail
    })
});


const schema = 
[
  check('fname').not().isEmpty().withMessage('First Name is required').isLength({ min: 2 }).withMessage('First Name Need more then 2 character').isString().withMessage('First Name Value can not be Number').escape().trim(),
  check('lname').not().isEmpty().withMessage('Last Name is required').isString().withMessage('Last Name Value can not be Number').escape().trim()
]

router.post('/update/name',schema, async (req, res) =>
{

    //Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) 
    {
        return res.status(422).json({ error: "Make sure your first and lastname is valid"});
    }


    var token = req.cookies.authToken;
    var decodedToken = jwtDecode(token)
    var userID = decodedToken._id

    var query = {_id: userID}
    var updateData = {'firstName': req.body.fname, 'lastName': req.body.lname}
    
    
    const user = await User.updateOne(query, updateData)

    if(!user)
    {
        return res.status(422).json({ error: "Error occure when performing update"});
    }

    const userinfo = await User.findOne({_id:userID})

    if(!userinfo)
    {
        res.status(404).send({
            error:"User cannot found"     
        })
    }

    res.status(200).json({
        message:userinfo

    })
});


module.exports = router;