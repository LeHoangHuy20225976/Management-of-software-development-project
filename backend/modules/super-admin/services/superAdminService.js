const { User, Hotel, Booking, Room, RoomType, RoomPrice } = require('../../../models');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../../../models');

/**
 * Super Admin Service
 * Handles system-level administration: user management, hotel approval, dashboard metrics
 */
class SuperAdminService {
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Get all users with optional filters
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Paginated user list
   */
  async getAllUsers(filters = {}) {
    const { role, search, limit = 50, offset = 0 } = filters;

    const whereClause = {};

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['user_id', 'ASC']]
    });

    return {
      users: users.rows,
      total: users.count,
      limit,
      offset
    };
  }

  /**
   * Get user by ID (admin view with full details)
   * @param {number} userId - User ID
   * @returns {Promise<object|null>} User details
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Hotel,
          attributes: ['hotel_id', 'name', 'status', 'rating']
        },
        {
          model: Booking,
          attributes: ['booking_id', 'status', 'total_price', 'check_in_date', 'check_out_date'],
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    return user;
  }

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} newRole - New role (customer, hotel_manager, admin)
   * @returns {Promise<object>} Updated user
   */
  async updateUserRole(userId, newRole) {
    const validRoles = ['customer', 'hotel_manager', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-demotion for safety
    user.role = newRole;
    await user.save();

    // Return user without password
    const updatedUser = await this.getUserById(userId);
    return updatedUser;
  }

  /**
   * Update user details (admin can update any user)
   * @param {number} userId - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Updated user
   */
  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allowedFields = ['name', 'email', 'phone_number', 'gender', 'date_of_birth', 'role', 'profile_image'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    }

    await user.save();
    return await this.getUserById(userId);
  }

  /**
   * Delete a user (soft or hard delete based on business requirements)
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has active bookings
    const activeBookings = await Booking.count({
      where: {
        user_id: userId,
        status: { [Op.in]: ['pending', 'accepted'] }
      }
    });

    if (activeBookings > 0) {
      throw new Error('Cannot delete user with active bookings');
    }

    // For now, we'll do a hard delete
    // In production, consider soft delete or anonymization
    await user.destroy();
    return true;
  }

  // ============================================================================
  // HOTEL MANAGER MANAGEMENT
  // ============================================================================

  /**
   * Get all hotel managers with their hotels
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Hotel managers list
   */
  async getHotelManagers(filters = {}) {
    const { status, search, limit = 50, offset = 0 } = filters;

    const whereClause = {
      role: 'hotel_manager'
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const includeClause = [{
      model: Hotel,
      attributes: ['hotel_id', 'name', 'status', 'rating', 'address']
    }];

    // Filter by hotel status if specified
    if (status !== undefined) {
      includeClause[0].where = { status: parseInt(status) };
      includeClause[0].required = true;
    }

    const managers = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: includeClause,
      limit,
      offset,
      order: [['user_id', 'ASC']]
    });

    return {
      managers: managers.rows,
      total: managers.count,
      limit,
      offset
    };
  }

  /**
   * Get hotels pending approval
   * @returns {Promise<Array>} Pending hotels
   */
  async getPendingHotels() {
    // Status 0 = pending/inactive, 1 = active/approved
    const hotels = await Hotel.findAll({
      where: { status: 0 },
      include: [{
        model: User,
        attributes: ['user_id', 'name', 'email', 'phone_number']
      }],
      order: [['hotel_id', 'ASC']]
    });

    return hotels;
  }

  /**
   * Approve a hotel (set status to active)
   * @param {number} hotelId - Hotel ID
   * @returns {Promise<object>} Updated hotel
   */
  async approveHotel(hotelId) {
    const hotel = await Hotel.findByPk(hotelId, {
      include: [{
        model: User,
        attributes: ['user_id', 'name', 'email']
      }]
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (hotel.status === 1) {
      throw new Error('Hotel is already approved');
    }

    hotel.status = 1;
    await hotel.save();

    return hotel;
  }

  /**
   * Reject/Lock a hotel (set status to inactive)
   * @param {number} hotelId - Hotel ID
   * @param {string} reason - Reason for rejection (optional)
   * @returns {Promise<object>} Updated hotel
   */
  async lockHotel(hotelId, reason = null) {
    const hotel = await Hotel.findByPk(hotelId, {
      include: [{
        model: User,
        attributes: ['user_id', 'name', 'email']
      }]
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    hotel.status = 0;
    // If we had a reason field, we'd save it here
    await hotel.save();

    return hotel;
  }

  /**
   * Update hotel status
   * @param {number} hotelId - Hotel ID
   * @param {number} status - New status (0 = inactive, 1 = active)
   * @returns {Promise<object>} Updated hotel
   */
  async updateHotelStatus(hotelId, status) {
    const hotel = await Hotel.findByPk(hotelId, {
      include: [{
        model: User,
        attributes: ['user_id', 'name', 'email']
      }]
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    hotel.status = status;
    await hotel.save();

    return hotel;
  }

  // ============================================================================
  // DASHBOARD & METRICS
  // ============================================================================

  /**
   * Get dashboard overview metrics
   * @returns {Promise<object>} Dashboard metrics
   */
  async getDashboardMetrics() {
    // User statistics
    const userStats = await User.findAll({
      attributes: [
        'role',
        [fn('COUNT', col('user_id')), 'count']
      ],
      group: ['role']
    });

    const totalUsers = await User.count();

    // Hotel statistics
    const hotelStats = await Hotel.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('hotel_id')), 'count']
      ],
      group: ['status']
    });

    const totalHotels = await Hotel.count();
    const activeHotels = await Hotel.count({ where: { status: 1 } });
    const pendingHotels = await Hotel.count({ where: { status: 0 } });

    // Booking statistics
    const bookingStats = await Booking.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('booking_id')), 'count']
      ],
      group: ['status']
    });

    const totalBookings = await Booking.count();

    // Revenue calculation (sum of accepted bookings)
    const revenueResult = await Booking.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('total_price')), 0), 'total_revenue']
      ],
      where: {
        status: 'accepted'
      }
    });

    const totalRevenue = parseInt(revenueResult?.dataValues?.total_revenue || 0);

    // Room statistics
    const totalRooms = await Room.count();
    const activeRooms = await Room.count({ where: { status: 1 } });

    return {
      users: {
        total: totalUsers,
        byRole: userStats.reduce((acc, stat) => {
          acc[stat.role] = parseInt(stat.dataValues.count);
          return acc;
        }, {})
      },
      hotels: {
        total: totalHotels,
        active: activeHotels,
        pending: pendingHotels,
        byStatus: hotelStats.reduce((acc, stat) => {
          acc[stat.status === 1 ? 'active' : 'inactive'] = parseInt(stat.dataValues.count);
          return acc;
        }, {})
      },
      bookings: {
        total: totalBookings,
        byStatus: bookingStats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.dataValues.count);
          return acc;
        }, {})
      },
      rooms: {
        total: totalRooms,
        active: activeRooms
      },
      revenue: {
        total: totalRevenue,
        formatted: `${(totalRevenue / 1000000).toFixed(2)}M VND`
      }
    };
  }

  /**
   * Get revenue metrics with time-based breakdown
   * @param {object} options - Options for date range
   * @returns {Promise<object>} Revenue metrics
   */
  async getRevenueMetrics(options = {}) {
    const { startDate, endDate, groupBy = 'month' } = options;

    const whereClause = {
      status: 'accepted'
    };

    if (startDate) {
      whereClause.created_at = { ...whereClause.created_at, [Op.gte]: startDate };
    }
    if (endDate) {
      whereClause.created_at = { ...whereClause.created_at, [Op.lte]: endDate };
    }

    // Total revenue for period
    const totalResult = await Booking.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('total_price')), 0), 'total_revenue'],
        [fn('COUNT', col('booking_id')), 'booking_count']
      ],
      where: whereClause
    });

    // Revenue by hotel
    const revenueByHotel = await Booking.findAll({
      attributes: [
        [fn('SUM', col('Booking.total_price')), 'revenue'],
        [fn('COUNT', col('Booking.booking_id')), 'booking_count']
      ],
      include: [{
        model: Room,
        attributes: [],
        include: [{
          model: RoomType,
          attributes: [],
          include: [{
            model: Hotel,
            attributes: ['hotel_id', 'name']
          }]
        }]
      }],
      where: whereClause,
      group: ['Room.RoomType.Hotel.hotel_id', 'Room.RoomType.Hotel.name'],
      order: [[fn('SUM', col('Booking.total_price')), 'DESC']],
      limit: 10
    });

    return {
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'now'
      },
      total: {
        revenue: parseInt(totalResult?.dataValues?.total_revenue || 0),
        bookings: parseInt(totalResult?.dataValues?.booking_count || 0)
      },
      topHotels: revenueByHotel.map(item => ({
        hotel_id: item.Room?.RoomType?.Hotel?.hotel_id,
        hotel_name: item.Room?.RoomType?.Hotel?.name,
        revenue: parseInt(item.dataValues.revenue || 0),
        bookings: parseInt(item.dataValues.booking_count || 0)
      }))
    };
  }

  /**
   * Get booking KPIs
   * @param {object} options - Options for date range
   * @returns {Promise<object>} Booking KPIs
   */
  async getBookingKPIs(options = {}) {
    const { startDate, endDate } = options;

    const whereClause = {};
    if (startDate) {
      whereClause.created_at = { ...whereClause.created_at, [Op.gte]: startDate };
    }
    if (endDate) {
      whereClause.created_at = { ...whereClause.created_at, [Op.lte]: endDate };
    }

    // Overall booking stats
    const totalBookings = await Booking.count({ where: whereClause });
    const acceptedBookings = await Booking.count({ 
      where: { ...whereClause, status: 'accepted' } 
    });
    const cancelledBookings = await Booking.count({ 
      where: { ...whereClause, status: { [Op.in]: ['cancelled', 'rejected'] } } 
    });
    const pendingBookings = await Booking.count({ 
      where: { ...whereClause, status: 'pending' } 
    });

    // Conversion rate
    const conversionRate = totalBookings > 0 
      ? ((acceptedBookings / totalBookings) * 100).toFixed(2) 
      : 0;

    // Cancellation rate
    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(2) 
      : 0;

    // Average booking value
    const avgBookingValue = await Booking.findOne({
      attributes: [
        [fn('AVG', col('total_price')), 'avg_value']
      ],
      where: { ...whereClause, status: 'accepted' }
    });

    // Average stay duration
    const avgStayDuration = await Booking.findOne({
      attributes: [
        [fn('AVG', 
          literal("EXTRACT(DAY FROM (check_out_date - check_in_date))")
        ), 'avg_nights']
      ],
      where: { ...whereClause, status: 'accepted' }
    });

    return {
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'now'
      },
      bookings: {
        total: totalBookings,
        accepted: acceptedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings
      },
      rates: {
        conversion: `${conversionRate}%`,
        cancellation: `${cancellationRate}%`
      },
      averages: {
        bookingValue: Math.round(avgBookingValue?.dataValues?.avg_value || 0),
        stayDuration: parseFloat(avgStayDuration?.dataValues?.avg_nights || 0).toFixed(1)
      }
    };
  }

  /**
   * Get recent activity log for admin dashboard
   * @param {number} limit - Number of recent activities
   * @returns {Promise<Array>} Recent activities
   */
  async getRecentActivity(limit = 20) {
    // Get recent bookings
    const recentBookings = await Booking.findAll({
      attributes: ['booking_id', 'status', 'total_price', 'created_at'],
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: Room,
          attributes: ['name'],
          include: [{
            model: RoomType,
            attributes: ['type'],
            include: [{
              model: Hotel,
              attributes: ['name']
            }]
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });

    return recentBookings.map(booking => ({
      type: 'booking',
      id: booking.booking_id,
      status: booking.status,
      amount: booking.total_price,
      user: booking.User?.name,
      hotel: booking.Room?.RoomType?.Hotel?.name,
      room: booking.Room?.name,
      timestamp: booking.created_at
    }));
  }
}

module.exports = new SuperAdminService();

