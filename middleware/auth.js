const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  console.log("auth.js")
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401);
      throw new Error('Authentication token missing');
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-password').lean();
    if (!user) {
      res.status(401);
      throw new Error('Invalid token');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error('Unauthorized access'));
  }
};

module.exports = authenticate;
