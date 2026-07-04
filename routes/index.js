const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const applicantRoutes = require('./applicants');
const categoryRoutes = require('./categories');
const typeRoutes = require('./types');
const referrerRoutes = require('./referrers');

router.use('/auth', authRoutes);
router.use('/applicants', applicantRoutes);
router.use('/categories', categoryRoutes);
router.use('/types', typeRoutes);
router.use('/referrers', referrerRoutes);

module.exports = router;
