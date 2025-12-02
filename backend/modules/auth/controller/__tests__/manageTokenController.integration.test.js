const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const config = require('configs/index');

// Mock database
jest.mock('models/index', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

jest.mock('configs/index', () => ({
  jwt: {
    secret: 'test-secret-key',
    ttl: '1h'
  },
  config: {
    jwt: {
      secret: 'test-secret-key',
      ttl: '1h'
    }
  }
}));

const db = require('models/index');
const manageTokenController = require('../manageTokenController');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/refresh-tokens', manageTokenController.refreshTokens);

describe('ManageTokenController - Integration Tests', () => {
  describe('POST /refresh-tokens', () => {
    const mockUser = {
      user_id: 1,
      role: 'customer'
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should successfully refresh tokens with valid refresh token cookie', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);
      
      // Create a valid refresh token
      const validRefreshToken = jwt.sign(
        { userId: 1, role: 'customer' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${validRefreshToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'ok');
      
      // Check that new cookies are set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.length).toBe(2);
      
      const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='));
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      
      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
      expect(accessTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('HttpOnly');
    });

    it('should return 401 when refresh token is missing', async () => {
      // Act
      const response = await request(app)
        .post('/refresh-tokens');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Unauthorized, Please login again');
    });

    it('should return 401 when refresh token is invalid', async () => {
      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', ['refreshToken=invalid-token']);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid refresh token, Please login again');
    });

    it('should return 401 when refresh token is expired', async () => {
      // Arrange - Create an expired token
      const expiredToken = jwt.sign(
        { userId: 1, role: 'customer' },
        config.jwt.secret,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${expiredToken}`]);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid refresh token, Please login again');
    });

    it('should return 500 when user not found in database', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(null);
      
      const validRefreshToken = jwt.sign(
        { userId: 999, role: 'customer' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${validRefreshToken}`]);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should generate new tokens with correct user information', async () => {
      // Arrange
      const adminUser = { user_id: 2, role: 'admin' };
      db.User.findByPk.mockResolvedValue(adminUser);
      
      const validRefreshToken = jwt.sign(
        { userId: 2, role: 'admin' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${validRefreshToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(db.User.findByPk).toHaveBeenCalledWith(2, {
        attributes: ['user_id', 'role']
      });

      // Extract and verify new access token
      const cookies = response.headers['set-cookie'];
      const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='));
      const accessToken = accessTokenCookie.split(';')[0].split('=')[1];
      
      const decoded = jwt.verify(accessToken, config.jwt.secret);
      expect(decoded.userId).toBe(2);
      expect(decoded.role).toBe('admin');
    });

    it('should set correct cookie options for security', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);
      
      const validRefreshToken = jwt.sign(
        { userId: 1, role: 'customer' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${validRefreshToken}`]);

      // Assert
      const cookies = response.headers['set-cookie'];
      
      cookies.forEach(cookie => {
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
      });
      
      const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='));
      expect(accessTokenCookie).toContain('Max-Age=3600'); // 1 hour
      
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      expect(refreshTokenCookie).toContain('Max-Age=604800'); // 1 week
    });

    it('should handle multiple refresh requests sequentially', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);
      
      let currentRefreshToken = jwt.sign(
        { userId: 1, role: 'customer' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Act - First refresh
      const response1 = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${currentRefreshToken}`]);

      expect(response1.status).toBe(200);

      // Extract new refresh token from response
      const cookies1 = response1.headers['set-cookie'];
      const newRefreshTokenCookie = cookies1.find(c => c.startsWith('refreshToken='));
      currentRefreshToken = newRefreshTokenCookie.split(';')[0].split('=')[1];

      // Act - Second refresh with new token
      const response2 = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${currentRefreshToken}`]);

      // Assert
      expect(response2.status).toBe(200);
      expect(response2.body).toHaveProperty('message', 'ok');
    });

    it('should return error when database throws error', async () => {
      // Arrange
      db.User.findByPk.mockRejectedValue(new Error('Database connection failed'));
      
      const validRefreshToken = jwt.sign(
        { userId: 1, role: 'customer' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${validRefreshToken}`]);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Database connection failed');
    });

    it('should reject token signed with different secret', async () => {
      // Arrange
      const tokenWithWrongSecret = jwt.sign(
        { userId: 1, role: 'customer' },
        'wrong-secret',
        { expiresIn: '7d' }
      );

      // Act
      const response = await request(app)
        .post('/refresh-tokens')
        .set('Cookie', [`refreshToken=${tokenWithWrongSecret}`]);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid refresh token, Please login again');
    });
  });
});
