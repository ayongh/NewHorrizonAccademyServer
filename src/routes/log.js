
const router = require('express').Router();
var MongoClient = require('mongodb').MongoClient;

/**
 * @typedef logBody
 * @property {integer} datasize
*/


/**
 * 
 * This function comment is parsed by doctrine
 * @route POST /log
 * @group log - All the Login Operation
 * @param {logBody.model} LoginCredentials.body - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {Array.<object>} 200 - Return user data with a login Auth in cookie
 * @security JWT
*/
  
router.post('/', async (req, res) =>
{
    var dataLimit = req.body.datasize

    if(dataLimit === undefined || dataLimit<1)
    {
        dataLimit = 20
    }

    const url = process.env.DB_log_Connection
    MongoClient.connect(url,{ useUnifiedTopology: true } , function(err, client){
        if(err)
        {
            console.log("error when logging")
        }

        var dbo = client.db("logger")

        dbo.collection("log").find().limit(dataLimit).sort({timestamp:-1}).toArray(function(err, result) {
            if (err) throw err;
            client.close();
            return res.status(200).send(result)

        });

    })
    
});


module.exports = router;