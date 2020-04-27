var jsonSize = require('json-size')
var MongoClient = require('mongodb').MongoClient;

module.exports.log = function (req,res,status,message,payload, starttime) { 

   const url = process.env.DB_log_Connection
    MongoClient.connect(url,{ useUnifiedTopology: true } , function(err, client){
        if(err)
        {
            console.log("error when logging")
        }

        var dbo = client.db("logger")

        let date = new Date()
        var level;
        if(status>=200 && status<400)
        {
            level="Info"
        } 
        else if(status>=400 && status<500)
        {
            level="Warning"
        }
        else
        {
            level ="Error"
        }
        
        var datasize = jsonSize(payload) + " bytes"
        var Message = message
        var method = req.method
        var route = req.originalUrl
        var time =  process.hrtime(starttime)
        var executiontime = time[0] +'s ' +( time[1] / 1000000) +'ms'
        var identifier = req.cookie;

        if(route === "/user/login")
        {
            if( status === 200)
            {
                Message = message.message
                identifier = message.cookie
            }
            else
            {
                identifier = req.body.email
            }

        }

        var logData = 
        {   
            timestamp:date,
            errorLevel: level, 
            message:Message, 
            reqHeader:req.headers, 
            identifier:identifier, 
            connectionIP:req.ip, 
            method:method, 
            route: route, 
            size:datasize, 
            executiontime:executiontime
        }

        dbo.collection("log").insertOne(logData, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
          });
        
            
    })

};
  