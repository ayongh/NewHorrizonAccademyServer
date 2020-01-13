const jwt = require('jsonwebtoken');
//import jwt from 'jsonwebtoken'; 

console.log("generating Refresh Token")
const generateToken = (res, id, firstname) => {
  const expiration =  100;
  const token = jwt.sign({ id, firstname }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '1d',
  });
  return res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: true,
  });
};

console.log('Refresh Token: ' + generateToken)
module.exports = generateToken

// generateToken.js file