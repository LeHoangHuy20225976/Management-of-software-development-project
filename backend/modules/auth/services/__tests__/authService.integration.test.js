const authService = require('../authService');
const bcrypt = require('bcryptjs');
const { sign, signRefreshToken } = require('utils/jwtUtils');
const redis = require('utils/redisClient');
const { Op } = require('sequelize');

// Mock only database and JWT, but use REAL bcrypt
jest.mock('models/index', () => ({
  User: {
    findOne: jest.fn()
  }
}));

jest.mock('utils/jwtUtils', () => ({
  sign: jest.fn(),
  signRefreshToken: jest.fn()
}));

jest.mock('utils/redisClient', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
}));

jest.mock('sequelize', () => ({
  Op: {
    and: Symbol('and')
  }
}));

jest.mock('configs/index', () => ({}));

const db = require('models/index');

describe('AuthService - Integration Tests with Real Bcrypt', () => {
  describe('login with real bcrypt', () => {
    let hashedPassword;
    const plainPassword = 'password123';
    
    const mockUserData = {
      email: 'test@example.com',
      password: plainPassword,
      role: 'customer'
    };

    beforeAll(async () => {
      // Hash password once before all tests (expensive operation)
      hashedPassword = await bcrypt.hash(plainPassword, 10);
    });

    const mockUser = {
      user_id: 1,
      name: 'Test User',
      email: 'test@example.com',
      get password() { return hashedPassword; }, // Use getter to get hashed password
      gender: 'male',
      role: 'customer',
      profile_image: 'image.jpg'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully login with valid credentials using real bcrypt', async () => {
      // Arrange
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      db.User.findOne = jest.fn().mockResolvedValue(mockUser);
      sign.mockReturnValue(mockAccessToken);
      signRefreshToken.mockReturnValue(mockRefreshToken);

      // Act
      const result = await authService.login(mockUserData);

      // Assert - bcrypt.compare was called with REAL implementation
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: {
          [Op.and]: [
            { email: mockUserData.email },
            { role: mockUserData.role }
          ]
        }
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

    it('should reject login with wrong password using real bcrypt', async () => {
      // Arrange
      const wrongPasswordData = {
        ...mockUserData,
        password: 'wrongpassword123'
      };

      db.User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(wrongPasswordData))
        .rejects
        .toThrow('Username or password is incorrect');

      expect(db.User.findOne).toHaveBeenCalled();
      // bcrypt.compare actually ran and returned false
    });

    it('should handle bcrypt hashing verification correctly', async () => {
      // Test that bcrypt can verify different passwords
      const testPassword = 'mySecretPassword';
      const hash = await bcrypt.hash(testPassword, 10);
      
      const validCheck = await bcrypt.compare(testPassword, hash);
      const invalidCheck = await bcrypt.compare('wrongPassword', hash);
      
      expect(validCheck).toBe(true);
      expect(invalidCheck).toBe(false);
    });

    it('should work with different bcrypt salt rounds', async () => {
      // Demonstrate bcrypt with different salt rounds
      const password = 'testPassword';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 12);
      
      // Both hashes should validate the same password
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
      
      // But the hashes themselves should be different
      expect(hash1).not.toBe(hash2);
    });

    it('should measure bcrypt comparison performance', async () => {
      // Demonstrate that bcrypt.compare is relatively slow (intentional for security)
      const password = 'testPassword';
      const hash = await bcrypt.hash(password, 10);
      
      const startTime = Date.now();
      await bcrypt.compare(password, hash);
      const duration = Date.now() - startTime;
      
      // Bcrypt should take at least some time (usually 50-200ms for 10 rounds)
      console.log(`Bcrypt comparison took: ${duration}ms`);
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('register with real bcrypt', () => {
    const mockRegisterData = {
      name: 'New User',
      email: 'newuser@example.com',
      phone_number: '1234567890',
      gender: 'male',
      date_of_birth: '1990-01-01',
      role: 'customer',
      password: 'mySecurePassword123!',
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

    it('should successfully register a new user with real bcrypt hashing', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(null); // No existing user
      db.User.create = jest.fn().mockImplementation(async (userData) => {
        // Verify password is hashed
        expect(userData.password).not.toBe(mockRegisterData.password);
        expect(userData.password).toMatch(/^\$2[aby]\$\d+\$/); // Bcrypt hash pattern
        
        // Verify the hashed password can be compared
        const isValid = await bcrypt.compare(mockRegisterData.password, userData.password);
        expect(isValid).toBe(true);
        
        return {
          ...mockCreatedUser,
          password: userData.password
        };
      });

      // Act
      const result = await authService.register(mockRegisterData);

      // Assert
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: mockRegisterData.email }
      });
      expect(db.User.create).toHaveBeenCalled();
      expect(result).toEqual({
        email: mockCreatedUser.email
      });
    });

    it('should create different hashes for same password on multiple registrations', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(null);
      
      const hashes = [];
      db.User.create = jest.fn().mockImplementation(async (userData) => {
        hashes.push(userData.password);
        return {
          ...mockCreatedUser,
          password: userData.password
        };
      });

      // Act - Register same user data twice
      await authService.register(mockRegisterData);
      await authService.register(mockRegisterData);

      // Assert - Hashes should be different (bcrypt uses random salt)
      expect(hashes).toHaveLength(2);
      expect(hashes[0]).not.toBe(hashes[1]);
      
      // But both should validate the original password
      const valid1 = await bcrypt.compare(mockRegisterData.password, hashes[0]);
      const valid2 = await bcrypt.compare(mockRegisterData.password, hashes[1]);
      expect(valid1).toBe(true);
      expect(valid2).toBe(true);
    });

    it('should reject weak passwords (if validation were added)', async () => {
      // This demonstrates how you could test password strength
      const weakPasswords = ['123', 'password', 'abc'];
      
      for (const weakPass of weakPasswords) {
        const hash = await bcrypt.hash(weakPass, 10);
        const isValid = await bcrypt.compare(weakPass, hash);
        expect(isValid).toBe(true);
        
        // Note: bcrypt will hash any password, but you should add
        // password strength validation in your service
      }
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const existingUser = {
        user_id: 2,
        email: mockRegisterData.email,
        name: 'Existing User'
      };
      db.User.findOne = jest.fn().mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(mockRegisterData))
        .rejects
        .toThrow('User with this email already exists');

      expect(db.User.findOne).toHaveBeenCalled();
      expect(db.User.create).not.toHaveBeenCalled();
    });

    it('should verify bcrypt hash format and strength', async () => {
      // Arrange
      db.User.findOne = jest.fn().mockResolvedValue(null);
      
      let capturedHash;
      db.User.create = jest.fn().mockImplementation(async (userData) => {
        capturedHash = userData.password;
        return mockCreatedUser;
      });

      // Act
      await authService.register(mockRegisterData);

      // Assert - Verify hash format
      expect(capturedHash).toBeDefined();
      expect(capturedHash).toMatch(/^\$2[aby]\$10\$/); // Bcrypt with 10 rounds
      expect(capturedHash.length).toBeGreaterThan(50); // Bcrypt hashes are ~60 chars
      
      // Verify it's actually a valid bcrypt hash
      const isValidHash = await bcrypt.compare(mockRegisterData.password, capturedHash);
      expect(isValidHash).toBe(true);
      
      // Verify wrong password doesn't match
      const isInvalid = await bcrypt.compare('wrongpassword', capturedHash);
      expect(isInvalid).toBe(false);
    });

    it('should measure bcrypt hashing performance', async () => {
      // Demonstrate that hashing is slower than comparison (both intentional for security)
      const password = 'testPassword123';
      
      const hashStartTime = Date.now();
      const hash = await bcrypt.hash(password, 10);
      const hashDuration = Date.now() - hashStartTime;

      console.log(`Bcrypt hashing took: ${hashDuration}ms`);

      expect(hashDuration).toBeGreaterThanOrEqual(40); // Avoid flakiness on fast machines
      expect(hash).toMatch(/^\$2[aby]\$/); // Valid bcrypt hash
    });

    it('should handle special characters in password', async () => {
      // Arrange
      const specialPasswordData = {
        ...mockRegisterData,
        password: 'P@ssw0rd!#$%^&*(){}[]'
      };
      
      db.User.findOne = jest.fn().mockResolvedValue(null);
      
      let capturedHash;
      db.User.create = jest.fn().mockImplementation(async (userData) => {
        capturedHash = userData.password;
        return mockCreatedUser;
      });

      // Act
      await authService.register(specialPasswordData);

      // Assert - Special characters should be properly hashed
      expect(capturedHash).toBeDefined();
      const isValid = await bcrypt.compare(specialPasswordData.password, capturedHash);
      expect(isValid).toBe(true);
      
      // Original special characters should not appear in hash
      expect(capturedHash).not.toContain('@');
      expect(capturedHash).not.toContain('!');
      expect(capturedHash).not.toContain('#');
    });
  });

  describe('resetPassword with real bcrypt', () => {
    it('updates password when current is correct', async () => {
      const hashed = await bcrypt.hash('old-pass', 10);
      const user = {
        user_id: 99,
        password: hashed,
        save: jest.fn().mockResolvedValue()
      };
      db.User.findByPk = jest.fn().mockResolvedValue(user);

      const result = await authService.resetPassword(99, 'old-pass', 'new-pass', 'new-pass');

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(await bcrypt.compare('new-pass', user.password)).toBe(true);
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('resetForgetPassword integration', () => {
    it('resets when token matches and clears redis', async () => {
      const user = { email: 'a@example.com', password: 'old', save: jest.fn().mockResolvedValue() };
      db.User.findOne = jest.fn().mockResolvedValue(user);
      redis.get = jest.fn().mockResolvedValue('otp123');
      redis.del = jest.fn().mockResolvedValue();

      const result = await authService.resetForgetPassword('a@example.com', 'new-pass', 'otp123');

      expect(result).toEqual({ message: 'Password reset successfully.' });
      expect(await bcrypt.compare('new-pass', user.password)).toBe(true);
      expect(redis.del).toHaveBeenCalledWith('a@example.com');
    });

    it('fails when token invalid', async () => {
      db.User.findOne = jest.fn().mockResolvedValue({ email: 'a@example.com' });
      redis.get = jest.fn().mockResolvedValue('otp123');

      await expect(authService.resetForgetPassword('a@example.com', 'new-pass', 'bad'))
        .rejects.toThrow('Token mismatch.');
    });
  });

  describe('verifyForgetPassword integration', () => {
    it('stores OTP and calls sender', async () => {
      const email = 'v@example.com';
      db.User.findOne = jest.fn().mockResolvedValue({ email });
      redis.del = jest.fn().mockResolvedValue();
      redis.set = jest.fn().mockResolvedValue();
      const genSpy = jest.spyOn(authService, 'genOTP').mockResolvedValue(555555);
      const sendSpy = jest.spyOn(authService, 'sendOTP').mockResolvedValue(true);

      const result = await authService.verifyForgetPassword(email);

      expect(result).toEqual({
        message: 'Password reset link sent to email, please use this link to access the reset page.'
      });
      expect(genSpy).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith(email, 555555, { EX: 300 });
      expect(sendSpy).toHaveBeenCalled();
    });
  });
});
