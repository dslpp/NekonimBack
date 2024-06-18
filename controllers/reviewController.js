const { Review, User } = require('../models/models');
const ApiError = require('../error/ApiError');

class ReviewController {
  async addReview(req, res, next) {
    try {
      const { rating, comment, productId } = req.body;
      const userId = req.user.id;
      const review = await Review.create({ rating, comment, productId, userId });
      const reviewWithUser = await Review.findOne({
        where: { id: review.id },
        include: { model: User, attributes: ['id', 'name'] }
      });
      return res.json(reviewWithUser);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await Review.findAll({
        where: { productId },
        include: { model: User, attributes: ['id', 'name'] }
      });
      return res.json(reviews);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ReviewController();
