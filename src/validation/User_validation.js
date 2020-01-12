
//validation
const { check } = require('express-validator');


//Validation middle ware
const signup_schema = 
[
    check('fname').not().isEmpty().withMessage('First Name is required').withMessage('Need more then 2 character').isString().withMessage('Value can not be Number').escape().trim(),
    check('lname').not().isEmpty().withMessage('Last Name is required').isString().withMessage('Value can not be Number').escape().trim(),
    check('email').isString().withMessage('Value can not be Number').escape().isEmail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
          User.findOne({email: req.body.email}, function(err, user){
            if(err) {
              reject(new Error('Server Error'))
            }
            if(Boolean(user)) {
              reject(new Error(value+' E-mail already in use'))
            }
            resolve(true)
          });
        });
      }).not().isEmpty().withMessage('Email is required'),

    check('password').not().isEmpty().withMessage('password is required').isLength({ min: 8 }).withMessage('Need need atleast 8 character').isString().withMessage('Value can not be Number').escape().trim().matches(/\d/).withMessage('must contain a number')
]


module.exports = signup_schema;