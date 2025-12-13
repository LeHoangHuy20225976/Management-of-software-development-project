const superAdminService = require('../services/superAdminService');
const responseUtils = require('../../../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Super Admin Controller
 * Handles HTTP requests for system administration
 * 
 * Note: All endpoints require admin role (enforced by rbacMiddleware)
 */
const superAdminController = {
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Get all users with optional filters
   * GET /admin/users
   * Query: role, search, limit, offset
   */
  getAllUsers: async (req, res) => {
    try {
      const filters = {
        role: req.query.role,
        search: req.query.search,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await superAdminService.getAllUsers(filters);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get all users error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get user by ID
   * GET /admin/users/:id
   */
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await superAdminService.getUserById(parseInt(id));

      if (!user) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, { user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Update user role
   * PATCH /admin/users/:id/role
   * Body: { role: 'customer' | 'hotel_manager' | 'admin' }
   */
  updateUserRole: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.user.user_id;

      // Prevent admin from changing their own role
      if (parseInt(id) === adminId) {
        return responseUtils.error(res, 'Cannot change your own role');
      }

      const user = await superAdminService.updateUserRole(parseInt(id), role);
      return responseUtils.ok(res, {
        message: `User role updated to ${role}`,
        user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Update user details
   * PUT /admin/users/:id
   * Body: { name, email, phone_number, ... }
   */
  updateUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const user = await superAdminService.updateUser(parseInt(id), updateData);
      return responseUtils.ok(res, {
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete user
   * DELETE /admin/users/:id
   */
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.user_id;

      // Prevent admin from deleting themselves
      if (parseInt(id) === adminId) {
        return responseUtils.error(res, 'Cannot delete your own account');
      }

      await superAdminService.deleteUser(parseInt(id));
      return responseUtils.ok(res, { message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  // ============================================================================
  // HOTEL MANAGER MANAGEMENT
  // ============================================================================

  /**
   * Get all hotel managers
   * GET /admin/hotel-managers
   * Query: status, search, limit, offset
   */
  getHotelManagers: async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await superAdminService.getHotelManagers(filters);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get hotel managers error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get hotels pending approval
   * GET /admin/hotels/pending
   */
  getPendingHotels: async (req, res) => {
    try {
      const hotels = await superAdminService.getPendingHotels();
      return responseUtils.ok(res, {
        hotels,
        count: hotels.length
      });
    } catch (error) {
      console.error('Get pending hotels error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Approve a hotel
   * POST /admin/hotels/:id/approve
   */
  approveHotel: async (req, res) => {
    try {
      const { id } = req.params;
      const hotel = await superAdminService.approveHotel(parseInt(id));

      return responseUtils.ok(res, {
        message: `Hotel "${hotel.name}" has been approved`,
        hotel
      });
    } catch (error) {
      console.error('Approve hotel error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Lock/Reject a hotel
   * POST /admin/hotels/:id/lock
   * Body: { reason: 'optional reason' }
   */
  lockHotel: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const hotel = await superAdminService.lockHotel(parseInt(id), reason);

      return responseUtils.ok(res, {
        message: `Hotel "${hotel.name}" has been locked/deactivated`,
        hotel
      });
    } catch (error) {
      console.error('Lock hotel error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Update hotel status
   * PATCH /admin/hotels/:id/status
   * Body: { status: 0 | 1 }
   */
  updateHotelStatus: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { status } = req.body;

      const hotel = await superAdminService.updateHotelStatus(parseInt(id), status);
      const statusText = status === 1 ? 'activated' : 'deactivated';

      return responseUtils.ok(res, {
        message: `Hotel "${hotel.name}" has been ${statusText}`,
        hotel
      });
    } catch (error) {
      console.error('Update hotel status error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  // ============================================================================
  // DASHBOARD & METRICS
  // ============================================================================

  /**
   * Get dashboard overview
   * GET /admin/dashboard
   */
  getDashboard: async (req, res) => {
    try {
      const metrics = await superAdminService.getDashboardMetrics();
      return responseUtils.ok(res, { metrics });
    } catch (error) {
      console.error('Get dashboard error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get revenue metrics
   * GET /admin/metrics/revenue
   * Query: startDate, endDate
   */
  getRevenueMetrics: async (req, res) => {
    try {
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const metrics = await superAdminService.getRevenueMetrics(options);
      return responseUtils.ok(res, { metrics });
    } catch (error) {
      console.error('Get revenue metrics error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get booking KPIs
   * GET /admin/metrics/bookings
   * Query: startDate, endDate
   */
  getBookingKPIs: async (req, res) => {
    try {
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const kpis = await superAdminService.getBookingKPIs(options);
      return responseUtils.ok(res, { kpis });
    } catch (error) {
      console.error('Get booking KPIs error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get recent activity
   * GET /admin/activity
   * Query: limit
   */
  getRecentActivity: async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const activities = await superAdminService.getRecentActivity(limit);

      return responseUtils.ok(res, {
        activities,
        count: activities.length
      });
    } catch (error) {
      console.error('Get recent activity error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = superAdminController;

