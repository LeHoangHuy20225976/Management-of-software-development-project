const authService = require('../authService');
const bcrypt = require('bcryptjs');
const { sign, signRefreshToken } = require('utils/jwtUtils');
const { Op } = require('sequelize');

// Mock dependencies
jest.mock('models/index', () => ({
  User: {
    findOne: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

jest.mock('utils/jwtUtils', () => ({
  sign: jest.fn(),
  signRefreshToken: jest.fn()
}));

jest.mock('sequelize', () => ({
  Op: {
    and: Symbol('and')
  }
}));

jest.mock('configs/index', () => ({}));

const db = require('models/index');

describe('AuthService', () => {
  describe('login', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    };

    const mockUser = {
      user_id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: '$2a$10$hashedpassword',
      gender: 'male',
      role: 'customer',
      profile_image: 'image.jpg'
    };

    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      db.User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      sign.mockReturnValue(mockAccessToken);
      signRefreshToken.mockReturnValue(mockRefreshToken);

      // Act
      const result = await authService.login(mockUserData);

      // Assert
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: {
          [Op.and]: [
            { email: mockUserData.email },
            { role: mockUserData.role }
          ]
        }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockUserData.password, mockUser.password);
      expect(sign).toHaveBeenCalledWith({ 
        user_id: mockUser.user_id, 
        role: mockUser.role 
      });
      expect(signRefreshToken).toHaveBeenCalledWith({ 
        user_id: mockUser.user_id, 
        role: mockUser.role 
      });

      expect(result).toEqual({
        user: {
          user_id: mockUser.user_id,
          name: mockUser.name,
          gender: mockUser.gender,
          role: mockUser.role,
          profile_image: mockUser.profile_image
        },
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      });
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(mockUserData))
        .rejects
        .toThrow('Username or password is incorrect');

      expect(db.User.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password does not match', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(mockUserData))
        .rejects
        .toThrow('Username or password is incorrect');

      expect(db.User.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(mockUserData.password, mockUser.password);
      expect(sign).not.toHaveBeenCalled();
      expect(signRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw error when user with wrong role tries to login', async () => {
      // Arrange
      const wrongRoleData = {
        ...mockUserData,
        role: 'admin'
      };
      db.User.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(wrongRoleData))
        .rejects
        .toThrow('Username or password is incorrect');

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: {
          [Op.and]: [
            { email: wrongRoleData.email },
            { role: wrongRoleData.role }
          ]
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      db.User.findOne = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(authService.login(mockUserData))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should handle bcrypt comparison errors', async () => {
      // Arrange
      const bcryptError = new Error('Bcrypt error');
      db.User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockRejectedValue(bcryptError);

      // Act & Assert
      await expect(authService.login(mockUserData))
        .rejects
        .toThrow('Bcrypt error');
    });
  });

  describe('register', () => {
    const mockRegisterData = {
      name: 'New User',
      email: 'newuser@example.com',
      phone_number: '1234567890',
      gender: 'male',
      date_of_birth: '1990-01-01',
      role: 'customer',
      password: 'password123',
      profile_image: 'profile.jpg'
    };

    const mockCreatedUser = {
      user_id: 1,
      email: 'newuser@example.com',
      name: 'New User',
      phone_number: '1234567890',
      gender: 'male',
      date_of_birth: '1990-01-01',
      role: 'customer',
      profile_image: 'profile.jpg'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should successfully register a new user', async () => {
      // Arrange
      const mockHashedPassword = '$2a$10$mockedhashedpassword';
      
      db.User.findOne = jest.fn().mockResolvedValue(null); // No existing user
      bcrypt.hash = jest.fn().mockResolvedValue(mockHashedPassword);
      db.User.create = jest.fn().mockResolvedValue(mockCreatedUser);

      // Act
      const result = await authService.register(mockRegisterData);

      // Assert
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: mockRegisterData.email }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterData.password, 10);
      expect(db.User.create).toHaveBeenCalledWith({
        name: mockRegisterData.name,
        email: mockRegisterData.email,
        phone_number: mockRegisterData.phone_number,
        gender: mockRegisterData.gender,
        date_of_birth: mockRegisterData.date_of_birth,
        role: mockRegisterData.role,
        password: mockHashedPassword,
        profile_image: mockRegisterData.profile_image
      });
      expect(result).toEqual({
        email: mockCreatedUser.email
      });
    });

    it('should throw error when user with same email already exists', async () => {
      // Arrange
      const existingUser = {
        user_id: 2,
        email: 'newuser@example.com',
        name: 'Existing User'
      };

      db.User.findOne = jest.fn().mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(mockRegisterData))
        .rejects
        .toThrow('User with this email already exists');

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: mockRegisterData.email }
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(db.User.create).not.toHaveBeenCalled();
    });

    it('should handle database error when checking existing user', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      db.User.findOne = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(authService.register(mockRegisterData))
        .rejects
        .toThrow('Database connection failed');

      expect(db.User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hashing error', async () => {
      // Arrange
      const hashError = new Error('Hashing failed');
      db.User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockRejectedValue(hashError);

      // Act & Assert
      await expect(authService.register(mockRegisterData))
        .rejects
        .toThrow('Hashing failed');

      expect(db.User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(db.User.create).not.toHaveBeenCalled();
    });

    it('should handle database error when creating user', async () => {
      // Arrange
      const createError = new Error('Failed to create user');
      db.User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('$2a$10$hashedpassword');
      db.User.create = jest.fn().mockRejectedValue(createError);

      // Act & Assert
      await expect(authService.register(mockRegisterData))
        .rejects
        .toThrow('Failed to create user');

      expect(db.User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(db.User.create).toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('$2a$10$hashedpassword');
      db.User.create = jest.fn().mockResolvedValue(mockCreatedUser);

      // Act
      await authService.register(mockRegisterData);

      // Assert - Verify salt rounds is 10
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockRegisterData.password,
        10 // Salt rounds
      );
    });

    it('should not return password in response', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('$2a$10$hashedpassword');
      db.User.create = jest.fn().mockResolvedValue(mockCreatedUser);

      // Act
      const result = await authService.register(mockRegisterData);

      // Assert - Password should not be in the result
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        email: mockCreatedUser.email
      });
    });
  });
});
