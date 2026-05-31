const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { list, getBySpace, create, updateStatus } = require('../controllers/reservationController');

const router = Router();
router.get('/', authenticate, list);
router.get('/space/:spaceId', getBySpace);
router.post('/', authenticate, create);
router.patch('/:id/status', authenticate, updateStatus);

module.exports = router;
