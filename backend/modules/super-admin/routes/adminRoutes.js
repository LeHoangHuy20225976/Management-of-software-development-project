const express = require('express');
const router = express.Router();
const superAdminController = require('../controller/superAdminController');
const adminValidation = require('../../../kernels/validations/adminValidation');
const middlewares = require('../../../kernels/middlewares');
const authMiddleware = require('../../../kernels/middlewares/authMiddleware');
const rbacMiddleware = require('../../../kernels/middlewares/rbacMiddleware');

/**
 * Super Admin Routes
 * Base path: /admin
 * 
 * All routes require admin role authentication
 * Permissions from rolePermissions.js:
 * - user:view_all, user:manage
 * - hotel:approve_manager, hotel:lock_manager
 * - dashboard:view_metrics
 */

// ============================================================================
// DASHBOARD & METRICS
// ============================================================================

// Get dashboard overview
router.get(
  '/dashboard',
  middlewares([authMiddleware, rbacMiddleware(['dashboard:view_metrics'])]),
  superAdminController.getDashboard
);

// Get revenue metrics
router.get(
  '/metrics/revenue',
  middlewares([authMiddleware, rbacMiddleware(['dashboard:view_metrics'])]),
  superAdminController.getRevenueMetrics
);

// Get booking KPIs
router.get(
  '/metrics/bookings',
  middlewares([authMiddleware, rbacMiddleware(['dashboard:view_metrics'])]),
  superAdminController.getBookingKPIs
);

// Get recent activity
router.get(
  '/activity',
  middlewares([authMiddleware, rbacMiddleware(['dashboard:view_metrics'])]),
  superAdminController.getRecentActivity
);

// ============================================================================
// USER MANAGEMENT
// ============================================================================

// Get all users
router.get(
  '/users',
  middlewares([authMiddleware, rbacMiddleware(['user:view_all'])]),
  superAdminController.getAllUsers
);

// Get user by ID
router.get(
  '/users/:id',
  middlewares([authMiddleware, rbacMiddleware(['user:view_all'])]),
  adminValidation.userId,
  superAdminController.getUserById
);

// Update user role
router.patch(
  '/users/:id/role',
  middlewares([authMiddleware, rbacMiddleware(['user:manage'])]),
  adminValidation.updateUserRole,
  superAdminController.updateUserRole
);

// Update user details
router.put(
  '/users/:id',
  middlewares([authMiddleware, rbacMiddleware(['user:manage'])]),
  adminValidation.updateUser,
  superAdminController.updateUser
);

// Delete user
router.delete(
  '/users/:id',
  middlewares([authMiddleware, rbacMiddleware(['user:manage'])]),
  adminValidation.userId,
  superAdminController.deleteUser
);

// ============================================================================
// HOTEL MANAGER MANAGEMENT
// ============================================================================

// Get all hotel managers
router.get(
  '/hotel-managers',
  middlewares([authMiddleware, rbacMiddleware(['user:view_all'])]),
  superAdminController.getHotelManagers
);

// Get hotels pending approval
router.get(
  '/hotels/pending',
  middlewares([authMiddleware, rbacMiddleware(['hotel:approve_manager'])]),
  superAdminController.getPendingHotels
);

// Approve a hotel
router.post(
  '/hotels/:id/approve',
  middlewares([authMiddleware, rbacMiddleware(['hotel:approve_manager'])]),
  adminValidation.hotelId,
  superAdminController.approveHotel
);

// Lock/Reject a hotel
router.post(
  '/hotels/:id/lock',
  middlewares([authMiddleware, rbacMiddleware(['hotel:lock_manager'])]),
  adminValidation.hotelId,
  superAdminController.lockHotel
);

// Update hotel status
router.patch(
  '/hotels/:id/status',
  middlewares([authMiddleware, rbacMiddleware(['hotel:approve_manager', 'hotel:lock_manager'])]),
  adminValidation.updateHotelStatus,
  superAdminController.updateHotelStatus
);

module.exports = router;

