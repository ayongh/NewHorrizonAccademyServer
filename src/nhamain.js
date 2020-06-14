const express = require('express');
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
var cookieParser = require('cookie-parser'); //under obesrvation
var bodyParser = require('body-parser')
const morgan = require('morgan')

const expressSwagger = require('express-swagger-generator')(app);

//import Routes 
const Course = require('./routes/course');
const user_signup = require('./routes/user_signup')
const user_login = require('./routes/user_login')
const user_logout = require('./routes/user_logout')
const token_validation = require('./routes/validatetoken')
const user_pswdreset = require('./routes/user_pswdreset')
const class_create = require('./routes/create_course')
const section_create = require('./routes/create_section')
const user_info = require('./routes/user_info')
const WelcomePage = require('./routes/welcome')
const Recomendation = require('./routes/recomendation')
var sendError = require('./middle_ware/emailError')
var Log = require("./routes/log")
var classRender = require("./routes/renderclass")

var gethost=process.env.SWAGGERHOST
dotenv.config();
let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: gethost,
        basePath: '/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['https', 'http'],
		securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/**/*.js'] //Path to the API handle folder
};
expressSwagger(options)

//Middle ware
app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.json())


//Core Config: Make sure To investigate more
app.use(function(req, res, next) {
    var allowedOrigin = ['https://nhaclient.herokuapp.com','https://ancient-plateau-56456.herokuapp.com','http://localhost:3000', 'http://nhaclient.herokuapp.com' , 'http://www.nhalearn.online']
    var headersReq = req.headers.origin;

    if(allowedOrigin.indexOf(headersReq) > -1)
    {
        res.header("Access-Control-Allow-Origin", headersReq);
    }
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

try {
    //connect to DB
    mongoose.connect(process.env.DB_Connection,{ useNewUrlParser: true, useUnifiedTopology: true }, (error)=>
    {
        if(error)
        {
            sendError.sendError({message:"error connecting to Database", error: error})
        }
    })
} catch (error) {
    sendError.sendError({message:"error connecting to Database from try catch", error: error})
}

//Route Middle ware
app.use('/', WelcomePage);
app.use('/user/signup', user_signup);
app.use('/user/login', user_login);
app.use('/user/logout', user_logout);
app.use('/user/pswdReset', user_pswdreset);
app.use('/user/info', user_info);

app.use('/token/validation', token_validation);
app.use('/recomendation',Recomendation);

app.use('/course', Course);
app.use('/render/class', classRender);
app.use('/course/create', class_create);
app.use('/section', section_create);
app.use('/log', Log);

const server = app.listen(process.env.PORT || 3001, ()=> {
    console.log('Server running in localhost://3001/')
});

server.on('error', function(e){
    sendError.sendError({message:"error occured when listening to server", error: e})
})

server.keepAliveTimeout = 61*1000;