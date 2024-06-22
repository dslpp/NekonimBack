// В routes/reviewRouter.js

const Router = require('express');
const router = new Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', authMiddleware, reviewController.addReview);
router.get('/:productId', reviewController.getReviews);
router.delete('/:id',checkRole('ADMIN'), authMiddleware, reviewController.deleteReview); 

module.exports = router;
