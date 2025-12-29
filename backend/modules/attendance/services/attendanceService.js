const db = require('../../../models');
const AttendanceLog = db.AttendanceLog;
const User = db.User;
const { Op } = require('sequelize');
const axios = require('axios');
const FormData = require('form-data');

const AI_CV_SERVICE_URL = process.env.AI_CV_SERVICE_URL || 'http://localhost:8001';

class AttendanceService {
  /**
   * Create attendance record with image
   * @param {Object} params
   * @param {number} params.user_id - Staff user ID
   * @param {string} params.event_type - CHECK_IN or CHECK_OUT
   * @param {Buffer} params.imageBuffer - Image file buffer
   * @param {string} params.originalname - Original filename
   * @param {string} params.location - Location (optional)
   * @returns {Promise<Object>} Attendance log
   */
  async createAttendanceWithImage({ user_id, event_type, imageBuffer, originalname, location }) {
    try {
      // 1. Verify user exists
      const user = await User.findByPk(user_id);
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Upload image to AI service (optional - for face recognition later)
      let imageUrl = null;
      try {
        const formData = new FormData();
        formData.append('file', imageBuffer, {
          filename: originalname,
          contentType: 'image/jpeg'
        });
        formData.append('user_id', user_id.toString());

        // Call AI service to upload and process face
        // This endpoint would save to MinIO and extract face embedding
        const uploadResponse = await axios.post(
          `${AI_CV_SERVICE_URL}/api/cv/attendance/upload`,
          formData,
          {
            headers: formData.getHeaders(),
            timeout: 30000
          }
        );

        imageUrl = uploadResponse.data.image_url;
      } catch (aiError) {
        console.warn('AI service upload failed, continuing without face recognition:', aiError.message);
        // Continue anyway - attendance can work without AI
      }

      // 3. Create attendance log in database
      const attendanceLog = await AttendanceLog.create({
        user_id,
        event_type,
        location: location || 'Unknown',
        captured_image_url: imageUrl,
        event_timestamp: new Date(),
        metadata: {
          manual_entry: true,
          image_uploaded: !!imageUrl
        }
      });

      return {
        log_id: attendanceLog.log_id,
        user_id: attendanceLog.user_id,
        user_name: user.name,
        event_type: attendanceLog.event_type,
        location: attendanceLog.location,
        image_url: imageUrl,
        timestamp: attendanceLog.event_timestamp
      };

    } catch (error) {
      console.error('Attendance Service Error:', error);
      throw error;
    }
  }

  /**
   * Get attendance logs
   * @param {Object} filters
   * @param {number} filters.user_id - Optional user filter
   * @param {string} filters.event_type - Optional event type filter
   * @param {Date} filters.start_date - Optional start date
   * @param {Date} filters.end_date - Optional end date
   * @returns {Promise<Array>} Attendance logs
   */
  async getAttendanceLogs(filters = {}) {
    try {
      const where = {};

      if (filters.user_id) {
        where.user_id = filters.user_id;
      }

      if (filters.event_type) {
        where.event_type = filters.event_type;
      }

      if (filters.start_date && filters.end_date) {
        where.event_timestamp = {
          [Op.gte]: filters.start_date,
          [Op.lte]: filters.end_date
        };
      }

      const logs = await AttendanceLog.findAll({
        where,
        include: [{
          model: User,
          attributes: ['user_id', 'name', 'email', 'role']
        }],
        order: [['event_timestamp', 'DESC']],
        limit: filters.limit || 100
      });

      return logs;
    } catch (error) {
      console.error('Get Attendance Logs Error:', error);
      throw error;
    }
  }

  /**
   * Get today's attendance summary
   * @param {number} user_id - Optional user filter
   * @returns {Promise<Object>} Summary
   */
  async getTodayAttendance(user_id = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where = {
        event_timestamp: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      };

      if (user_id) {
        where.user_id = user_id;
      }

      const logs = await AttendanceLog.findAll({
        where,
        include: [{
          model: User,
          attributes: ['user_id', 'name', 'email']
        }]
      });

      return {
        total_logs: logs.length,
        check_ins: logs.filter(l => l.event_type === 'CHECK_IN').length,
        check_outs: logs.filter(l => l.event_type === 'CHECK_OUT').length,
        logs
      };
    } catch (error) {
      console.error('Get Today Attendance Error:', error);
      throw error;
    }
  }
}

module.exports = new AttendanceService();
