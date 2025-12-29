const db = require("../../../models/index");
const bcrypt = require("bcryptjs");

const UserService = {
  /**
   * Get all users
   */
  async getAllUsers() {
    const users = await db.User.findAll({
      attributes: { exclude: ["password"] },
    });
    return users;
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  /**
   * Create a new user
   */
  async createUser(userData) {
    const {
      name,
      email,
      phone_number,
      gender,
      date_of_birth,
      role,
      password,
      profile_image,
    } = userData;

    // Check if user already exists by email
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
      name,
      email,
      phone_number,
      gender,
      date_of_birth,
      role,
      password: hashedPassword,
      profile_image,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  },

  /**
   * Update user by ID
   */
  async updateUser(userId, userData) {
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const {
      name,
      email,
      phone_number,
      gender,
      date_of_birth,
      role,
      password,
      profile_image,
    } = userData;

    // If email is being changed, check for duplicates
    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (gender !== undefined) updateData.gender = gender;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
    if (role !== undefined) updateData.role = role;
    if (profile_image !== undefined) updateData.profile_image = profile_image;

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  },

  /**
   * Delete user by ID
   */
  async deleteUser(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Với onDelete: 'CASCADE' trong models, Sequelize sẽ tự động xóa các bản ghi liên quan
    await user.destroy();
    return { message: "User and all related data deleted successfully" };
  },

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId) {
    // Check if user exists
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all bookings for this user with room details
    const bookings = await db.Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Room,
          attributes: ["room_id", "name"],
          include: [
            {
              model: db.RoomType,
              attributes: ["type_id", "type"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return bookings;
  },
};

module.exports = UserService;
