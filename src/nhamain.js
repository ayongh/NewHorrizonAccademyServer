
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors');
const cookieParser = require('cookie-parser');


//import Routes 
const Course = require('./routes/course');
const user_signup = require('./routes/user_signup')
const user_login = require('./routes/user_login')

dotenv.config();

//connect to DB
mongoose.connect(process.env.DB_Connection,{ useNewUrlParser: true, useUnifiedTopology: true }, ()=>console.log("connected to DB"))

//Middle ware
app.use(express.json())
app.use(cors())
app.use(cookieParser())

//Route Middle ware
app.use('/user/signup', user_signup);
app.use('/user/login', user_login);

app.use('/course', Course);

app.listen(3001, ()=> console.log('Server running in localhost://3001/'));