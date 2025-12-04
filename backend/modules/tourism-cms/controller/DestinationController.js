const responseUtils = require("../../../utils/responseUtils");
const DestinationService = require("../services/DestinationService");

const DestinationController = {
  /**
   * Get all destinations
   * GET /destinations
   */
  getAllDestinations: async (req, res) => {
    try {
      const destinations = await DestinationService.getAllDestinations();
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Get all destinations error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get destination by ID
   * GET /destinations/:id
   */
  getDestinationById: async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await DestinationService.getDestinationById(id);
      return responseUtils.ok(res, destination);
    } catch (error) {
      console.error("Get destination by ID error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Create a new destination
   * POST /destinations
   */
  createDestination: async (req, res) => {
    try {
      const destinationData = req.body;
      const newDestination = await DestinationService.createDestination(destinationData);
      return responseUtils.ok(res, newDestination);
    } catch (error) {
      console.error("Create destination error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Update destination by ID
   * PUT /destinations/:id
   */
  updateDestination: async (req, res) => {
    try {
      const { id } = req.params;
      const destinationData = req.body;
      const updatedDestination = await DestinationService.updateDestination(id, destinationData);
      return responseUtils.ok(res, updatedDestination);
    } catch (error) {
      console.error("Update destination error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete destination by ID
   * DELETE /destinations/:id
   */
  deleteDestination: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await DestinationService.deleteDestination(id);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error("Delete destination error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Search destinations by name or location
   * GET /destinations/search?q=query
   */
  searchDestinations: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return responseUtils.invalidated(res, [
          { field: "q", message: "Search query is required" },
        ]);
      }
      const destinations = await DestinationService.searchDestinations(q);
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Search destinations error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get destinations by type
   * GET /destinations/type/:type
   */
  getDestinationsByType: async (req, res) => {
    try {
      const { type } = req.params;
      const destinations = await DestinationService.getDestinationsByType(type);
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Get destinations by type error:", error);
      return responseUtils.error(res, error.message);
    }
  },
};

module.exports = DestinationController;
