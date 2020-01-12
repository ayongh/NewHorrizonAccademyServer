const router = require('express').Router();
const User = require('../model/User_model');
const bcrypt = require('bcryptjs');

//validation
const { check, validationResult } = require('express-validator');


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
    res.send(savedUser)
  } 
  catch(err)
  {
    res.status(400).send(err)
  }
});


module.exports = router;