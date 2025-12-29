const { body, param } = require('express-validator');

const hotelProfileValidation = {
  addHotel: [
    body('hotelData.hotelName').notEmpty().withMessage('Hotel name is required'),
    body('hotelData.address').notEmpty().withMessage('Address is required'),
    body('hotelData.contact_phone').notEmpty().withMessage('Contact phone is required'),
    body('hotelData.rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('hotelData.longitude').optional().isFloat().withMessage('Longitude must be a number'),
    // FIX: Sửa typo "latitute" thành "latitude"
    body('hotelData.latitude').optional().isFloat().withMessage('Latitude must be a number'),
    body('hotelData.description').optional(),
    body('hotelData.thumbnail').optional(),
  ],

  // CODE CŨ (có typo):
  /*
  addHotel: [
    body('hotelData.hotelName').notEmpty().withMessage('Hotel name is required'),
    body('hotelData.address').notEmpty().withMessage('Address is required'),
    body('hotelData.contact_phone').notEmpty().withMessage('Contact phone is required'),
    body('hotelData.rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('hotelData.longitude').optional().isFloat().withMessage('Longitude must be a number'),
    body('hotelData.latitute').optional().isFloat().withMessage('Latitute must be a number'), // TYPO HERE
    body('hotelData.description').optional(),
    body('hotelData.thumbnail').optional(),
  ],
  */

  addRoomType: [
    body('typeData.hotel_id').notEmpty().isInt({ min: 1 }).withMessage('hotel_id is required'),
    body('typeData.type').notEmpty().withMessage('type is required'),
    body('typeData.priceData.basic_price').notEmpty().isFloat().withMessage('basic_price is required'),
    body('typeData.priceData.special_price').optional().isFloat(),
    body('typeData.priceData.discount').optional().isFloat(),
    body('typeData.priceData.event').optional().isString(),
    body('typeData.availability').optional().isBoolean(),
    body('typeData.max_guests').optional().isInt({ min: 1 }),
    body('typeData.description').optional().isString(),
  ],

  addRoom: [
    body('roomData.type_id').notEmpty().isInt({ min: 1 }).withMessage('type_id is required'),
    body('roomData.name').notEmpty().withMessage('name is required'),
    body('roomData.location').notEmpty().withMessage('location is required'),
    body('roomData.number_of_single_beds').optional().isInt({ min: 0 }),
    body('roomData.number_of_double_beds').optional().isInt({ min: 0 }),
    body('roomData.room_view').optional().isString(),
    body('roomData.room_size').optional().isFloat(),
    body('roomData.notes').optional().isString(),
  ],

  updateHotel: [
    param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer'),
    body('hotelData.hotelName').optional().isString(),
    body('hotelData.address').optional().isString(),
    body('hotelData.status').optional().isInt(),
    body('hotelData.longitude').optional().isFloat(),
    body('hotelData.latitute').optional().isFloat(),
    body('hotelData.description').optional().isString(),
    body('hotelData.contact_phone').optional().isString(),
    body('hotelData.thumbnail').optional(),
  ],

  deleteHotel: [
    param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer'),
  ],

  addFacility: [
    param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer'),
    body('facilityData.hotel_id').notEmpty().isInt({ min: 1 }).withMessage('hotel_id is required'),
    body('facilityData.facilities').isArray({ min: 1 }).withMessage('facilities array is required'),
    body('facilityData.facilities.*.facility_id').notEmpty().isInt({ min: 1 }).withMessage('facility_id is required'),
    body('facilityData.facilities.*.description').optional().isString(),
  ],

  updatePrice: [
    body('priceData.type_id').notEmpty().isInt({ min: 1 }).withMessage('type_id is required'),
    body('priceData.basic_price').optional().isFloat(),
    body('priceData.special_price').optional().isFloat(),
    body('priceData.discount').optional().isFloat(),
    body('priceData.event').optional().isString(),
    body('priceData.start_date').optional().isISO8601(),
    body('priceData.end_date').optional().isISO8601(),
  ],

  viewHotel: [param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer')],
  viewRoomTypes: [param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer')],
  viewAllRooms: [param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer')],
  viewRoom: [param('room_id').isInt({ min: 1 }).withMessage('room_id must be a positive integer')],
  viewFacilities: [param('hotel_id').isInt({ min: 1 }).withMessage('hotel_id must be a positive integer')],
  updateRoom: [
    param('room_id').isInt({ min: 1 }).withMessage('room_id must be a positive integer'),

    body('roomData.name').optional().isString(),
    body('roomData.location').optional().isString(),
    body('roomData.status').optional().isInt(),
    body('roomData.estimated_available_time').optional().isISO8601(),
    body('roomData.number_of_single_beds').optional().isInt({ min: 0 }),
    body('roomData.number_of_double_beds').optional().isInt({ min: 0 }),
    body('roomData.room_view').optional().isString(),
    body('roomData.room_size').optional().isFloat({ min: 0 }),
    body('roomData.notes').optional().isString(),
  ],
  viewRoomType: [param('type_id').isInt({ min: 1 }).withMessage('type_id must be a positive integer')],
  updateRoomType: [
    param('type_id').isInt({ min: 1 }).withMessage('type_id must be a positive integer'),

    body('typeData.type').optional().isString(),
    body('typeData.availability').optional().isBoolean(),
    body('typeData.max_guests').optional().isInt({ min: 1 }),
    body('typeData.description').optional().isString(),
  ],
};

module.exports = hotelProfileValidation;
