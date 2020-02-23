
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
var cookieParser = require('cookie-parser');
const session = require('express-session')



//import Routes 
const Course = require('./routes/course');
const user_signup = require('./routes/user_signup')
const user_login = require('./routes/user_login')
const user_logout = require('./routes/user_logout')
const token_validation = require('./routes/validatetoken')
const user_pswdreset = require('./routes/user_pswdreset')
const class_create = require('./routes/create_course')
const section_create = require('./routes/create_section')

dotenv.config();


//Core Config: Make sure To investigate more
app.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin",process.env.ORIGIN);   //https://nhaclient.herokuapp.com  //http://localhost:3000 
res.header("Access-Control-Allow-Credentials", "true");
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});

//connect to DB
mongoose.connect(process.env.DB_Connection,{ useNewUrlParser: true, useUnifiedTopology: true }, ()=>console.log("connected to DB"))

//Middle ware
app.use(express.json())
app.use(cookieParser());

//Session Config
app.use(
    session({
        name:"authToken",
        secret: process.env.TOKEN_SECRET,
        resave:false,
        saveUninitialized:false,
        cookie:
        {
            httpOnly:true,
            secure:process.env.ENV === "production",
            maxAge: 1000*60*24 //one day
        }
    })
)

//Route Middle ware
app.use('/user/signup', user_signup);
app.use('/user/login', user_login);
app.use('/user/logout', user_logout);
app.use('/user/pswdReset', user_pswdreset);
app.use('/token/validation', token_validation);
app.use('/course', Course);
app.use('/class', class_create);
app.use('/section', section_create);

app.listen(process.env.PORT || 3001, ()=> console.log('Server running in localhost://3001/'));