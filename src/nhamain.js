
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
var cookieParser = require('cookie-parser');



//import Routes 
const Course = require('./routes/course');
const user_signup = require('./routes/user_signup')
const user_login = require('./routes/user_login')
const token_validation = require('./routes/validatetoken')
const user_pswdreset = require('./routes/user_pswdreset')

dotenv.config();


//Core Config: Make sure To investigate more
app.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin","https://nhaservertest.herokuapp.com");
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


//Route Middle ware
app.use('/user/signup', user_signup);
app.use('/user/login', user_login);
app.use('/user/pswdReset', user_pswdreset);
app.use('/token/validation', token_validation);
app.use('/course', Course);

app.listen(process.env.PORT || 3001, ()=> console.log('Server running in localhost://3001/'));