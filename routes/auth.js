const express = require('express');
const { register, login, adminLogin, logout, getCurrentUser, changePassword } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required');
  }
  next();
};

router.post('/register', authenticate, requireAdmin, register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/change-password', authenticate, requireAdmin, changePassword);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
