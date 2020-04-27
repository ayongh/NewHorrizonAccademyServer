const router = require('express').Router();
const User = require('../model/User_model');
const bcrypt = require('bcryptjs');
var speakeasy = require('speakeasy');
var verifyJWT = require('../validation/verify_signupToken')
const jwt = require('jsonwebtoken');

var sendVerificationCode = require('../middle_ware/varification_email')
var loger = require('../logger/logger');


//validation
const { check, validationResult } = require('express-validator');

/**
 * @typedef  signupSucessResult
 * @property {string} message
 * @property {integer} code
 * @property {boolean} login
*/

/**
 * @typedef  signupBody
 * @property {string} fname.required
 * @property {string} lname.required
 * @property {string} email.required
 * @property {string} password.required
 * @property {string} userInputedCode.required
*/

/**
 * This Route will add the user to the collection. Although /user/signup/emailvarification needs to be performed first since we need to validate the email.
 * 
 * @route POST /user/signup
 * @group Sign Up - Adds user to the collection using multiple routes
 * @param {signupBody.model} singup.body.required- Need signupEmailVerificationCredential Model to sucessfully create 
 * @produces application/json
 * @consumes application/json
 * @returns {signupSucessResult.model} 200 - Returns if the user making this request is Human or Bot
 * @security JWT
*/
//Validation middle ware
const schema = 
[
  check('fname').not().isEmpty().withMessage('First Name is required').isLength({ min: 2 }).withMessage('Need more then 2 character').isString().withMessage('Value can not be Number').escape().trim(),
  check('lname').not().isEmpty().withMessage('Last Name is required').isString().withMessage('Value can not be Number').escape().trim(),
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

  check('password').not().isEmpty().withMessage('password is required').isLength({ min: 8 }).withMessage('Need need atleast 8 character').isString().withMessage('Value can not be Number').escape().trim().matches(/\d/).withMessage('must contain a number')
]

   
router.post('/',schema, verifyJWT, async (req, res) =>
{
  //Start the timer for log execution
  var starttime = process.hrtime();

  //Validates if the body has all the required inpute
  const errors = validationResult(req);
  if (!errors.isEmpty()) 
  {
    var payload= { 
      errors: errors.array(),
      errorcode:422, 
      error:"Failed to meet the route inpute constraint"
    }
    loger.log(req,res,422,payload.error,payload,starttime)
    return res.status(422).send(payload);
  }


  //Also checks if the Body contains the userInputedCode for verification
  if( req.body.userInputedCode === undefined)
  {
    var payload ={
      errors:"user verification code is undefined", 
      errorcode:422
    }
    loger.log(req,res,422,payload.errors,payload,starttime)
    return res.status(422).send(payload)
  }
  
  //Then Checks the cookie called signup to validate the secret key initiated in the /emailverification
  if(req.cookies.signup=== undefined)
  {
    var payload = 
    {
      errors:"signup cookie is not available", 
      errorcode:400
    }

    loger.log(req,res,400,payload.errors,payload,starttime)
    return res.status(400).send()
  }

  const decodedjwt = jwt.verify(req.cookies.signup, process.env.TOKEN_SECRET)
  const match = await bcrypt.compare(req.body.userInputedCode, decodedjwt.key);

  if(!match) 
  {
    var payload=
    {
      error:"Validation code doesnt match", 
      errorcode:400
    }
    loger.log(req,res,400,payload.error,payload,starttime)
    return res.status(400).send(payload)
  }
  
  //Adds the data to the User Model
  const userModel = new User({
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    password:req.body.password
  })

  //Saves the data in the 
  try
  {
    const savedUser = await userModel.save();

    //Create and assign web token
    if(!savedUser)
    {
      var payload = {
        code: 403,
        login: true,
        message:"Sucessfully Created User"
      }
      loger.log(req,res,403,payload.message,payload,starttime)
      return res.status(403).send(payload)
    }

    //Successfully loges in

    var payload = {
      code: 200,
      login: true,
      message:"Sucessfully Created User"
    }
    loger.log(req,res,200,payload.message,payload,starttime)
    res.clearCookie("signup").status(200).send(payload)
  } 
  catch(err)
  {
    var payload = {
      error:"Internal error has ocurred when registering a user", 
      errorcode: 500
    }
    loger.log(req,res,500,payload.error,payload,starttime)
    return res.status(500).send(payload)
  }
}),

/**
 * @typedef signupEmailVerificationCredential
 * @property {string} fname
 * @property {string} lname
 * @property {string} email 
 * @property {string} password
*/

/**
 * @typedef  signupEmailVerificationSucessResult
 * @property {string} fname
 * @property {string} lname
 * @property {string} email 
 * @property {string} password 
 * @property {string} secret
*/

/**
* This route will validate the email and returns a cookie with fname, lname, email and password to be added in the user collection.
* @route POST /user/signup/emailvarification
* @group Sign Up - Adds user to the collection using multiple routes
* @param {signupEmailVerificationCredential.model} singup.body.required- Need signupEmailVerificationCredential Model to sucessfully create 
* @produces application/json
* @consumes application/json
* @returns {signupEmailVerificationSucessResult.model} 200 - Returns the signupEmailVerificationSucessResult model and cookie to signup
* @security JWT
*/
router.post('/emailvarification', schema, async (req, res) =>
{
  var starttime = process.hrtime();

  //Lets Validate the User data
  //Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);


  if (!errors.isEmpty()) 
  {
    payload = {
      errors: errors.array(), 
      errorcode: 403
    }
    loger.log(req,res,403,payload.errors[0],payload,starttime)
    return res.status(403).send(payload);
  }

  //Generate random number for email varification
  var secret = speakeasy.generateSecret({length: 5});

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt)
  const hashedSecret = await bcrypt.hash(secret.base32, salt)

  //Send email using node mailer
  sendVerificationCode.sendVarificationCode(secret.base32, req.body.email ,res)

  //Create and assign web token
  const token  = jwt.sign({key: hashedSecret}, process.env.TOKEN_SECRET, {expiresIn: "5 days"} )

  const cookieOptions = {
    httpOnly: true,
    maxAge:1000*60*60*10
  }

  var payload = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    password:hashedPassword,
    secret: hashedSecret
  }

  loger.log(req,res,200,"Sucessfully sent a secretkey and validation",payload,starttime)
  res.cookie('signup', token, cookieOptions).status(200).send(payload)
})


module.exports = router;