const attendanceService = require('../services/attendanceService');
const responseUtils = require('../../../utils/responseUtils');

class AttendanceController {
  /**
   * Upload attendance image and create log
   * POST /api/v1/attendance/upload
   */
  async uploadAttendance(req, res) {
    try {
      const { event_type, location } = req.body;
      const user_id = req.user.user_id; // From authMiddleware

      // Validate event type
      if (!event_type || !['CHECK_IN', 'CHECK_OUT'].includes(event_type)) {
        return responseUtils.invalidated(res, [
          { msg: 'event_type must be CHECK_IN or CHECK_OUT', param: 'event_type' }
        ]);
      }

      // Check if image file is provided
      if (!req.file) {
        return responseUtils.invalidated(res, [
          { msg: 'Image file is required', param: 'image' }
        ]);
      }

      // Create attendance log with image
      const log = await attendanceService.createAttendanceWithImage({
        user_id,
        event_type,
        imageBuffer: req.file.buffer,
        originalname: req.file.originalname,
        location
      });

      return responseUtils.ok(res, {
        message: 'Attendance logged successfully',
        log
      });

    } catch (error) {
      console.error('Upload Attendance Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get attendance logs
   * GET /api/v1/attendance/logs
   */
  async getAttendanceLogs(req, res) {
    try {
      const { user_id, event_type, start_date, end_date, limit } = req.query;

      const filters = {};
      if (user_id) filters.user_id = parseInt(user_id);
      if (event_type) filters.event_type = event_type;
      if (start_date) filters.start_date = new Date(start_date);
      if (end_date) filters.end_date = new Date(end_date);
      if (limit) filters.limit = parseInt(limit);

      const logs = await attendanceService.getAttendanceLogs(filters);

      return responseUtils.ok(res, {
        message: 'Attendance logs retrieved successfully',
        logs,
        count: logs.length
      });

    } catch (error) {
      console.error('Get Attendance Logs Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get today's attendance summary
   * GET /api/v1/attendance/today
   */
  async getTodayAttendance(req, res) {
    try {
      const user_id = req.query.user_id ? parseInt(req.query.user_id) : null;

      const summary = await attendanceService.getTodayAttendance(user_id);

      return responseUtils.ok(res, {
        message: 'Today attendance retrieved successfully',
        summary
      });

    } catch (error) {
      console.error('Get Today Attendance Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get my attendance logs (for staff)
   * GET /api/v1/attendance/my-logs
   */
  async getMyAttendance(req, res) {
    try {
      const user_id = req.user.user_id;
      const { start_date, end_date, limit } = req.query;

      const filters = { user_id };
      if (start_date) filters.start_date = new Date(start_date);
      if (end_date) filters.end_date = new Date(end_date);
      if (limit) filters.limit = parseInt(limit);

      const logs = await attendanceService.getAttendanceLogs(filters);

      return responseUtils.ok(res, {
        message: 'My attendance logs retrieved successfully',
        logs,
        count: logs.length
      });

    } catch (error) {
      console.error('Get My Attendance Error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new AttendanceController();
