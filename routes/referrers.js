const express = require('express');
const authenticate = require('../middleware/auth');
const {
  createReferrer,
  getReferrers,
  updateReferrer,
  deleteReferrer,
} = require('../controllers/referrerController');

const router = express.Router();
router.use(authenticate);

router.post('/', createReferrer);
router.get('/', getReferrers);
router.put('/:id', updateReferrer);
router.delete('/:id', deleteReferrer);

module.exports = router;
