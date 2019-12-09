const JWT = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  const privateKey = process.env.BUR_PRV_KEY;

  try {

    const decoded = JWT.verify(token, privateKey);
    req.tokenData = decoded;
    req.isAdmin = decoded.isAdmin;
    next();

  } catch (error) {

    return res.status(401).json('Token auth failed');

  }
};