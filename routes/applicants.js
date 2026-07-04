const express = require('express');
const authenticate = require('../middleware/auth');
const {
  createApplicant,
  getApplicants,
  updateApplicant,
  deleteApplicant,
} = require('../controllers/applicantController');

const router = express.Router();
router.use(authenticate);

router.post('/', createApplicant);
router.get('/', getApplicants);
router.put('/:id', updateApplicant);
router.delete('/:id', deleteApplicant);

module.exports = router;
