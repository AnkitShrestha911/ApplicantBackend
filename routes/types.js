const express = require('express');
const authenticate = require('../middleware/auth');
const {
  createType,
  getTypes,
  updateType,
  deleteType,
} = require('../controllers/typeController');

const router = express.Router();
router.use(authenticate);

router.post('/', createType);
router.get('/', getTypes);
router.put('/:id', updateType);
router.delete('/:id', deleteType);

module.exports = router;
