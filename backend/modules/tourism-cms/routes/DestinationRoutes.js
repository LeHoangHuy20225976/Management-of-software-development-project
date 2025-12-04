const express = require("express");
const router = express.Router();

const DestinationController = require("../controller/DestinationController");

/**
 * Destination Routes
 * Base path: /destinations
 */

// Public routes
router.get("/", DestinationController.getAllDestinations); // GET /destinations - Get all destinations
router.get("/search", DestinationController.searchDestinations); // GET /destinations/search?q= - Search destinations
router.get("/type/:type", DestinationController.getDestinationsByType); // GET /destinations/type/:type - Get by type
router.get("/:id", DestinationController.getDestinationById); // GET /destinations/:id - Get destination by ID

// Admin routes (có thể thêm authMiddleware sau)
router.post("/", DestinationController.createDestination); // POST /destinations - Create destination
router.put("/:id", DestinationController.updateDestination); // PUT /destinations/:id - Update destination
router.delete("/:id", DestinationController.deleteDestination); // DELETE /destinations/:id - Delete destination

module.exports = router;
