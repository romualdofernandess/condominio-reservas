const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { list, getById, create, update, remove } = require('../controllers/spaceController');

const router = Router();
router.get('/', list);
router.get('/:id', getById);
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
