const router = require('express').Router();
const User = require('../model/User_model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//validation
const { check, validationResult } = require('express-validator');


//Validation middle ware
const schema = 
[
  check('fname').not().isEmpty().withMessage('First Name is required').isLength({ min: 2 }).withMessage('First Name needs to be  more then 2 character').isString().withMessage('First Name can not be Number').escape().trim(),
  check('lname').not().isEmpty().withMessage('Last Name is required').isString().withMessage('Last Name can not be Number').escape().trim(),
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

  check('password').not().isEmpty().withMessage('password is required').isLength({ min: 8 }).withMessage('Password needs atleast 8 character').isString().withMessage('Password value can not be Number').escape().trim().matches(/\d/).withMessage('password must contain a number')
]

   
router.post('/', schema, async (req, res) =>
{

  //Lets Validate the User data
  //Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);


  if (!errors.isEmpty()) 
  {
    return res.status(403).json({ errors: errors.array() });
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  
  //Adds the data to the User Model
  const userModel = new User({
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    password:hashedPassword
  })

  //Saves the data in the 
  try
  {
    const savedUser = await userModel.save();

    //Create and assign web token
    const token  = jwt.sign({_id: savedUser._id}, process.env.TOKEN_SECRET, {expiresIn: "5 days"} )

    console.log(token)
    const cookieOptions = {
      httpOnly: true
    }

    //Successfully loges in
    res.cookie('authToken', token, cookieOptions).status(200).send({
      status:"Sucess",
      code: 200,
      login: true,
      token: token,
      message:"Sucessfully Created User"
    })
  } 
  catch(err)
  {
    res.status(400).send(err)
  }
});


module.exports = router;