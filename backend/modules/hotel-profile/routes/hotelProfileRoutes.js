const express = require("express");
const multer = require("multer");

const middlewares = require("../../../kernels/middlewares");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");
const rbacMiddleware = require("../../../kernels/middlewares/rbacMiddleware");
const { validate } = require("../../../kernels/validations");
const hotelProfileValidation = require("../../../kernels/validations/hotelProfileValidation");
const responseUtils = require("../../../utils/responseUtils");

const hotelProfileController = require("../controller/hotelProfileController");

const router = express.Router();

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const parseJsonField = (fieldName) => (req, res, next) => {
  const value = req.body?.[fieldName];
  if (typeof value !== "string") return next();
  try {
    req.body[fieldName] = JSON.parse(value);
    return next();
  } catch (error) {
    return responseUtils.invalidated(res, {
      errors: [{ field: fieldName, message: `Invalid JSON in ${fieldName}` }],
    });
  }
};

router.post(
  "/add-hotel",
  middlewares([authMiddleware]),
  upload.single("thumbnail"),
  parseJsonField("hotelData"),
  validate([hotelProfileValidation.addHotel]),
  hotelProfileController.addNewHotel
);
router.post(
  "/add-room-type",
  middlewares([authMiddleware, rbacMiddleware(["room:create"])]),
  validate([hotelProfileValidation.addRoomType]),
  hotelProfileController.addTypeForHotel
);
router.post(
  "/add-room",
  middlewares([authMiddleware, rbacMiddleware(["room:create"])]),
  upload.array("images", 10),
  parseJsonField("roomData"),
  validate([hotelProfileValidation.addRoom]),
  hotelProfileController.addRoom
);
router.get(
  "/view-hotel/:hotel_id",
  validate([hotelProfileValidation.viewHotel]),
  hotelProfileController.viewHotelProfile
);
router.put(
  "/update-hotel/:hotel_id",
  middlewares([authMiddleware, rbacMiddleware(["hotel:update"])]),
  upload.single("thumbnail"),
  parseJsonField("hotelData"),
  validate([hotelProfileValidation.updateHotel]),
  hotelProfileController.updateHotelProfile
);
router.delete(
  "/delete-hotel/:hotel_id",
  middlewares([authMiddleware, rbacMiddleware(["hotel:update"])]),
  validate([hotelProfileValidation.deleteHotel]),
  hotelProfileController.disableHotel
);
router.post(
  "/add-facility/:hotel_id",
  middlewares([authMiddleware, rbacMiddleware(["hotel:update"])]),
  validate([hotelProfileValidation.addFacility]),
  hotelProfileController.addFacilityForHotel
);
router.put(
  "/update-price",
  middlewares([authMiddleware, rbacMiddleware(["room:update"])]),
  validate([hotelProfileValidation.updatePrice]),
  hotelProfileController.updatePriceForRoomType
);
router.get(
  "/view-room-types/:hotel_id",
  validate([hotelProfileValidation.viewRoomTypes]),
  hotelProfileController.getAllTypeForHotel
);
router.get(
  "/view-all-rooms/:hotel_id",
  validate([hotelProfileValidation.viewAllRooms]),
  hotelProfileController.getAllRoomsForHotel
);
router.get("/all-rooms", hotelProfileController.getAllRooms);
router.get("/all-hotels", hotelProfileController.getAllHotels);
router.post(
  "/upload-images-for-hotel/:hotel_id",
  middlewares([authMiddleware, rbacMiddleware(["hotel:update"])]),
  upload.array("images", 10), // Max 10 images
  hotelProfileController.uploadImagesForHotel
);
router.post(
  "/upload-images-for-room/:room_id",
  middlewares([authMiddleware, rbacMiddleware(["room:update"])]),
  upload.array("images", 10), // Max 10 images
  hotelProfileController.uploadImagesForRoom
);
router.get(
  "/hotel-manager/hotels",
  middlewares([authMiddleware, rbacMiddleware(["hotel:update"])]),
  hotelProfileController.getHotelForHotelOwner
);
module.exports = router;
