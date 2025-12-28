const destinationService = require("../services/destinationService");
const responseUtils = require("../../../utils/responseUtils");

const destinationController = {
  // Get all destinations
  getAllDestinations: async (req, res) => {
    try {
      const destinations = await destinationService.getAllDestinations();
      return responseUtils.ok(res, destinations);
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  },

  // Get destination by ID
  getDestinationById: async (req, res) => {
    try {
      const { destination_id } = req.params;
      const destination = await destinationService.getDestinationById(destination_id);
      return responseUtils.ok(res, destination);
    } catch (error) {
      if (error.message === 'Destination not found') {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(res, error.message);
    }
  },

  // Search destinations
  searchDestinations: async (req, res) => {
    try {
      const { location } = req.query;
      if (!location) {
        const allDestinations = await destinationService.getAllDestinations();
        return responseUtils.ok(res, allDestinations);
      }
      const destinations = await destinationService.searchDestinations(location);
      return responseUtils.ok(res, destinations);
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  },

  // Add review
  addReview: async (req, res) => {
    try {
      const { destination_id } = req.params;
      const reviewData = req.body;
      const review = await destinationService.addReview(destination_id, reviewData);
      return responseUtils.created(res, review);
    } catch (error) {
      if (error.message === 'Destination not found') {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(res, error.message);
    }
  },

  // Get destination reviews
  getDestinationReviews: async (req, res) => {
    try {
      const { destination_id } = req.params;
      const reviews = await destinationService.getDestinationReviews(destination_id);
      return responseUtils.ok(res, reviews);
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = destinationController;
