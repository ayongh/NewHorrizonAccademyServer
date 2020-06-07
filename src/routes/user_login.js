const router = require('express').Router();
const axios = require('axios');
var cookie = require('cookie');

const User = require('../model/User_model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//validation
const { check, validationResult } = require('express-validator');
var loger = require('../logger/logger');

/**
 * @typedef LoginCredentials
 * @property {string} email.required
 * @property {string} password.required
*/

 

/**
 * @typedef loginSucessMessage
 * @property {Array.<string>} watchHistory
 * @property {string} firstName - Abhishek 
 * @property {string} lastName - Yonghang
 * @property {string} email - something@gmail.com
*/


/**
 * @typedef LoginSucess
 * @property {string} status - success - eg:123
 * @property {integer} code - 200
 * @property {loginSucessMessage.model} message
*/


/**
 * 
 * This function comment is parsed by doctrine
 * @route POST /user/login
 * @group Login - All the Login Operation
 * @param {LoginCredentials.model} LoginCredentials.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {LoginSucess.model} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/
const schema = 
[
    check('email').not().isEmpty().withMessage('Email is required').isString().withMessage('Value can not be Number').escape().isEmail().withMessage('Invalid Email address'),
    check('password').not().isEmpty().withMessage('password is required').isLength({ min: 8 }).withMessage('Invalid password, please review').isString().withMessage('Value can not be Number').escape().trim().matches(/\d/).withMessage('must contain a number')
]
  
router.post('/',schema, async (req, res) =>
{
    try {

        var starttime = process.hrtime();

        //Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);

        if (!errors.isEmpty()) 
        {
            var payload = { 
                status:"Error",
                errorcode:422,
                errors: "Failed to meet the email and password constraints"}
            loger.log(req,res,422,payload.errors,payload, starttime)
            return res.status(422).send(payload);
        }

        if(req.body.email === undefined || req.body.password === undefined)
        {
            var payload = { 
            status:"Error",
            errorcode:422,
            errors: "email and passsowrd is required"}
            loger.log(req,res,422,payload.errors,payload, starttime)
            return res.status(422).send(payload);
        }
        //Checking email exists
        const user = await User.findOne({email:req.body.email})

        if (!user) 
        {
            var payload ={
                status:"Error",
                errorcode: 403,
                errors:"user with email " + req.body.email +" doesn't exist"
            }
            loger.log(req,res,payload.errorcode,payload.errors,payload, starttime)
            return res.status(403).send(payload)
        }
        
        //Checking Password and decryprting
        const validatePassword = await bcrypt.compare(req.body.password, user.password)

        if(!validatePassword) 
        {
            var payload ={
                status:"Error",
                errorcode: 403,
                errors:"user with email " + req.body.email +" password doesn't match"
            }
            loger.log(req,res,payload.errorcode,payload.errors,payload, starttime)
            return res.status(403).send(payload)
        }
        
        //Create and assign web token
        const token  = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: "5 days"} )

        const cookieOptions = {
            path:'/',
            domain:'.nhalearn.online',
            maxAge:1000*60*60*24*5,
        }

        //Successfully loges in
        var payload = {
            status:"Sucess",
            code: 200,
            login: true,
            token: token,
            message:{
                watchHistory: user.watchHistory,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        }

        res.setHeader('Set-Cookie', cookie.serialize('name', token, cookieOptions));

        console.log(token)
        loger.log(req,res,200,{message:"sucessfully loged in", cookie:token},payload, starttime)
        res.cookie('authToken', token, cookieOptions).status(200).send(payload)
        
    } catch (error) {

        loger.log(req,res,500,error,payload, starttime)
        res.status(500).send({error:"Fatal error has occured"})
    }
    

});


/**
 * @typedef recaptchaCredential
 * @property {string} token.required
*/

/**
 * @typedef recaptchaSucessResult
 * @property {string} message
 * @property {integer} code
 * @property {boolean} login
*/

/**
 * This function comment is parsed by doctrine
 * @route POST /user/login/recaptcha
 * @group Login - All the Login Operation
 * @param {recaptchaCredential.model} token.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {recaptchaSucessResult.model} 200 - Returns if the user making this request is Human or Bot
 * @security JWT
*/
router.post('/recaptcha', async (req, res) =>
{
    if(req.body.token === undefined)
    {
        var payload= {
            error:"Token from recaptcha is required to validate the human",
            code: 417,
            login:false
        }
        loger.log(req,res,417, payload.error,payload,starttime)
        return res.status(417).send(payload)
    }
    try{
        var starttime = process.hrtime();

        let APIURL = "https://www.google.com/recaptcha/api/siteverify?secret="+process.env.RECAPTCHA_SECRETKEY+"&response="+req.body.token
        axios.get(APIURL).then(response => {

            if(response.data.success && response.data.score > 0.4)
            {
                var payload = {
                    message:"successfuly varified human",
                    code:200,
                    login:true
                }
                loger.log(req,res,200,{message:"sucessfully validated recaptcha token", score:response.data.score},payload,starttime)
                return res.status(200).send(payload)
            }
            else
            {
                var payload= {
                    error:"Malicious intent identified",
                    code: 417,
                    login:false
                }
                loger.log(req,res,417,payload.error,payload,starttime)
                return res.status(417).send(payload)

            }
        })
    }catch(e)
    {
        var payload=null
        loger.log(req,res,500,{message:e, location:"error catch during recaptcha axios service"},payload,starttime)
    }
})


module.exports = router;