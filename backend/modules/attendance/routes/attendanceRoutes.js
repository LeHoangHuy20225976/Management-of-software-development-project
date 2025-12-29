const express = require('express');
const router = express.Router();
const multer = require('multer');
const attendanceController = require('../controller/attendanceController');
const authMiddleware = require('../../../kernels/middlewares/authMiddleware');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * @route POST /api/v1/attendance/upload
 * @desc Upload attendance image and create log
 * @access Private (authenticated users)
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  attendanceController.uploadAttendance
);

/**
 * @route GET /api/v1/attendance/logs
 * @desc Get attendance logs (admin/manager)
 * @access Private
 */
router.get(
  '/logs',
  authMiddleware,
  attendanceController.getAttendanceLogs
);

/**
 * @route GET /api/v1/attendance/my-logs
 * @desc Get my attendance logs
 * @access Private
 */
router.get(
  '/my-logs',
  authMiddleware,
  attendanceController.getMyAttendance
);

/**
 * @route GET /api/v1/attendance/today
 * @desc Get today's attendance summary
 * @access Private
 */
router.get(
  '/today',
  authMiddleware,
  attendanceController.getTodayAttendance
);

module.exports = router;
