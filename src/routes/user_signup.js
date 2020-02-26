const router = require('express').Router();
const User = require('../model/User_model');
const bcrypt = require('bcryptjs');
<<<<<<< HEAD
var speakeasy = require('speakeasy');
var verifyJWT = require('../validation/verify_token')
const jwt = require('jsonwebtoken');

var sendVerificationCode = require('../middle_ware/varification_email')

=======
>>>>>>> parent of 01d55e4... First Commit

//validation
const { check, validationResult } = require('express-validator');

//fname
//lname
//email
//password
//verification 

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

   
router.post('/', schema, async (req, res) =>
{
  //Lets Validate the User data
  //Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);

  if (!errors.isEmpty()) 
  {
      return res.status(422).json({ errors: errors.array() });
  }

  if( req.body.userInputedCode === undefined && req.body.hasedVerifedCode=== undefined)
  {
    return res.status(400).send({error:"verification code is undefined"})
  }

  const match = await bcrypt.compare(req.body.userInputedCode, req.body.hasedVerifedCode);
   
  if(!match) {
    return res.status(400).send({error:"Validation code doesnt match"})
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
    const token  = jwt.sign({_id: savedUser._id}, process.env.TOKEN_SECRET, {expiresIn: "5 days"} )

    const cookieOptions = {
      httpOnly: true,
      maxAge: 1000*60*24*5
    }

    //Successfully loges in
    res.cookie('authToken', token, cookieOptions).status(200).send({
      status:"Sucess",
      code: 200,
      login: true,
      message:"Sucessfully Created User"
    })
  } 
  catch(err)
  {
    return res.status(400).send(err)
  }
}),


router.post('/emailvarification', schema, async (req, res) =>
{

  //Lets Validate the User data
  //Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);


  if (!errors.isEmpty()) 
  {
    return res.status(403).json({ errors: errors.array() });
  }

  //Generate random number for email varification
  var secret = speakeasy.generateSecret({length: 5});

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt)
  const hashedSecret = await bcrypt.hash(secret.base32, salt)

  //Send email using node mailer
  sendVerificationCode.sendVarificationCode(secret.base32, req.body.email ,res)

  res.status(200).send({
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    password:hashedPassword,
    secret: hashedSecret
  })
})


module.exports = router;