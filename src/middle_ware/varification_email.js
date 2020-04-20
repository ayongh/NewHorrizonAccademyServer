let nodeMailer = require('nodemailer')

// Send verification Code
module.exports.sendVarificationCode = async function(token, email ,res) 
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
        to: email,
        subject: "Varification Code",
        text: "your verification code is " + token
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(401).send({error:"failed to send email"})
        }
    });
    
   
    
}
