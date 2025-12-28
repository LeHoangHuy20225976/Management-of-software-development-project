const db = require("../../../models");

const destinationService = {
  // Get all destinations
  getAllDestinations: async () => {
    const destinations = await db.Destination.findAll({
      include: [
        {
          model: db.Image,
          as: 'Images',
          attributes: ['image_id', 'image_url']
        }
      ],
      order: [['destination_id', 'ASC']]
    });
    return destinations;
  },

  // Get destination by ID
  getDestinationById: async (destinationId) => {
    const destination = await db.Destination.findByPk(destinationId, {
      include: [
        {
          model: db.Image,
          as: 'Images',
          attributes: ['image_id', 'image_url']
        }
      ]
    });

    if (!destination) {
      throw new Error('Destination not found');
    }

    return destination;
  },

  // Search destinations by location
  searchDestinations: async (location) => {
    const destinations = await db.Destination.findAll({
      where: {
        location: {
          [db.Sequelize.Op.iLike]: `%${location}%`
        }
      },
      include: [
        {
          model: db.Image,
          as: 'Images',
          attributes: ['image_id', 'image_url']
        }
      ]
    });
    return destinations;
  },

  // Add review for destination
  addReview: async (destinationId, reviewData) => {
    const destination = await db.Destination.findByPk(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    const review = await db.Review.create({
      destination_id: parseInt(destinationId),
      user_id: reviewData.user_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      title: reviewData.title,
      date_created: new Date()
    });

    return review;
  },

  // Get reviews for destination
  getDestinationReviews: async (destinationId) => {
    const reviews = await db.Review.findAll({
      where: { destination_id: destinationId },
      include: [
        {
          model: db.User,
          attributes: ['name', 'profile_image']
        }
      ],
      order: [['date_created', 'DESC']]
    });

    return reviews.map(review => ({
      ...review.toJSON(),
      userName: review.User?.name,
      userAvatar: review.User?.profile_image
    }));
  }
};

module.exports = destinationService;
