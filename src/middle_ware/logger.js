const log4js = require('log4js')

log4js.configure({
    appenders: { loger: { type: 'file', filename: 'logs.log' } },
    categories: { default: { appenders: ['loger'], level: 'debug'} }
});
const logger = log4js.getLogger('loger');

module.exports.log = function(req, logType, message, status, startTime)
{
    var time =  process.hrtime(startTime)

    if(logType === 'error')
    {
        logger.error("Request From: "+req.headers.referer, "Route: "+ req.url,"http Method: "+req.method, "error: "+message,"Status: "+ status, "execution time: "+time[0] +'s ', time[1] / 1000000 +'ms')
    }
    else if(logType === 'fatal') 
    {
        logger.fatal("Request From: "+req.headers.referer, "Route: "+ req.url,"http Method: "+req.method, "error: "+message,"Status: "+ status, "execution time: "+time[0] +'s ', time[1] / 1000000 +'ms')
    }
    else if(logType === 'info')
    {
        logger.info("Request From: "+req.headers.referer, "Route: "+ req.url,"http Method: "+req.method, "error: "+message,"Status: "+ status, "execution time: "+time[0] +'s ', time[1] / 1000000 +'ms')
    }
}