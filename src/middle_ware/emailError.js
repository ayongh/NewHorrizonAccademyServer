let nodeMailer = require('nodemailer')
var loger = require('../logger/logger');

// Send verification Code
module.exports.sendError = async function(error) 
{
    
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            // should be replaced with real sender's account
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    let mailOptions = {
        to: "ayongh1@gmail.com",
        subject: "Fatal Error in NHA server",
        text: JSON.stringify(error)
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            //System Error
            console.log(error)
        }
    });
    
   
    
}
