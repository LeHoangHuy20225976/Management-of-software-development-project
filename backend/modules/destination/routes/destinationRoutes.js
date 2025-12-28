const express = require("express");
const destinationController = require("../controller/destinationController");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.get("/all", destinationController.getAllDestinations);
router.get("/search", destinationController.searchDestinations);
router.get("/:destination_id", destinationController.getDestinationById);
router.get("/:destination_id/reviews", destinationController.getDestinationReviews);

// Protected routes
router.post("/:destination_id/reviews", authMiddleware, destinationController.addReview);

module.exports = router;
