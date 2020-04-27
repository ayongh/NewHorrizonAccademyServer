const router = require('express').Router();
const User = require('../model/User_model');
const jwt = require('jsonwebtoken');
var speakeasy = require('speakeasy');
var jwtDecode = require('jwt-decode');
var verify = require('../validation/verify_pswdReset_token')
const bcrypt = require('bcryptjs');

var sendVerificationCode = require('../middle_ware/varification_email')


//validation
const { check, validationResult } = require('express-validator');


//Validation middle ware
const schema = 
[
    check('email').not().isEmpty().withMessage('Email is required').isString().withMessage('Email can not be Number').escape().isEmail().withMessage('Invalid Email address')
]
  
router.post('/',schema, async (req, res) =>
{
    var starttime = process.hrtime();

    //Lets Validate the User data
    //Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) 
    {
        return res.status(403).json({ errors: errors.array() });
    }

    //Checking email exists
    const user = await User.findOne({email:req.body.email})

    if (!user) return res.status(404).send({
        status:"Error",
        code: 404,
        error:"user with email " + req.body.email +" doesn't exist"
    })

    //Generate random number 
    var secret = speakeasy.generateSecret({length: 5});

    var payload = {
        userID: user.id,
        authCode: secret.base32
    }

    //Create and assign web token
    const token  = jwt.sign({_id: payload}, process.env.TOKEN_SECRET,{expiresIn: 300})

    const cookieOptions = {
        httpOnly: true
    }

    //Send email using node mailer
    sendVerificationCode.sendVarificationCode(secret.base32, req.body.email ,res)

    //Successfully loges in
    res.cookie('pswdreset', token, cookieOptions).status(200).send({
        status:"Sucess",
        code: 200,
        message:user.id
    })

});


router.post('/confirmation', verify, (req, res) =>
{
    var token = req.cookies.pswdreset;
    var inputAuth = req.body.authCode;

    var decoded = jwtDecode(token);

    if( decoded._id.authCode !== inputAuth)
    {
        return res.status(404).send({ error: " Verification code doesn't match"})
    }

    res.status(200).send({
        message: " Verification code matches"
    })

});


//Validation middle ware
const passwordschema = 
[
    check('password').not().isEmpty().withMessage('password is required').isLength({ min: 8 }).withMessage('Password needs atleast 8 character').isString().withMessage('Password value can not be Number').escape().trim().matches(/\d/).withMessage('password must contain a number')
]

router.post('/updatePswd',verify,passwordschema, async (req, res) =>
{
    //Lets Validate the User data
    //Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);


    if (!errors.isEmpty()) 
    {
        return res.status(403).json({ errors: errors.array() });
    }
   
    var token = req.cookies.pswdreset;
    var decoded = jwtDecode(token);

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    var query = {
        _id: decoded._id.userID
    }
    
    User.updateOne(query,{password: hashedPassword}, function(err, result)
    {
        if(err){ 
            return res.status(401).send({error:"failed to update the password"})
        }
    })

    res.clearCookie("pswdreset").status(200).send({ message: "Sucessfully updated password"})
});


module.exports = router;