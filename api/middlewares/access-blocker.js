module.exports = (req, res, next) => {

  return res.status(403).json({
    message: 'API deprecated. Access denied.'
  });

};