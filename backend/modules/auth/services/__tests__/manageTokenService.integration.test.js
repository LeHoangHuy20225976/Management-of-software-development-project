const manageTokenService = require('../manageTokenService');
const jwt = require('jsonwebtoken');
const config = require('configs/index');

// Mock only the database, use real JWT utilities
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

describe('ManageTokenService - Integration Tests', () => {
  describe('refreshNewPairTokens with real JWT', () => {
    const mockUserId = 1;
    const mockUser = {
      user_id: 1,
      role: 'customer'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate valid JWT tokens that can be decoded', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert - Verify tokens can be decoded
      const decodedAccessToken = jwt.verify(result.accessToken, config.jwt.secret);
      const decodedRefreshToken = jwt.verify(result.refreshToken, config.jwt.secret);

      expect(decodedAccessToken).toMatchObject({
        userId: mockUser.user_id,
        role: mockUser.role
      });

      expect(decodedRefreshToken).toMatchObject({
        userId: mockUser.user_id,
        role: mockUser.role
      });

      expect(decodedAccessToken).toHaveProperty('iat');
      expect(decodedAccessToken).toHaveProperty('exp');
      expect(decodedRefreshToken).toHaveProperty('iat');
      expect(decodedRefreshToken).toHaveProperty('exp');
    });

    it('should generate tokens with correct expiration times', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert
      const decodedAccessToken = jwt.verify(result.accessToken, config.jwt.secret);
      const decodedRefreshToken = jwt.verify(result.refreshToken, config.jwt.secret);

      // Access token should expire in ~1 hour (3600 seconds)
      const accessTokenLifetime = decodedAccessToken.exp - decodedAccessToken.iat;
      expect(accessTokenLifetime).toBe(3600);

      // Refresh token should expire in ~1 year (31557600 seconds = 365.25 days)
      const refreshTokenLifetime = decodedRefreshToken.exp - decodedRefreshToken.iat;
      expect(refreshTokenLifetime).toBe(31557600);
    });

    it('should generate different tokens for different users', async () => {
      // Arrange
      const user1 = { user_id: 1, role: 'customer' };
      const user2 = { user_id: 2, role: 'admin' };

      // Act
      db.User.findByPk.mockResolvedValue(user1);
      const result1 = await manageTokenService.refreshNewPairTokens(1);

      db.User.findByPk.mockResolvedValue(user2);
      const result2 = await manageTokenService.refreshNewPairTokens(2);

      // Assert
      expect(result1.accessToken).not.toBe(result2.accessToken);
      expect(result1.refreshToken).not.toBe(result2.refreshToken);

      const decoded1 = jwt.verify(result1.accessToken, config.jwt.secret);
      const decoded2 = jwt.verify(result2.accessToken, config.jwt.secret);

      expect(decoded1.userId).toBe(1);
      expect(decoded1.role).toBe('customer');
      expect(decoded2.userId).toBe(2);
      expect(decoded2.role).toBe('admin');
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(manageTokenService.refreshNewPairTokens(999))
        .rejects
        .toThrow('User not found');
    });

    it('should generate tokens with valid JWT structure', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert - Check JWT format (header.payload.signature)
      expect(result.accessToken.split('.')).toHaveLength(3);
      expect(result.refreshToken.split('.')).toHaveLength(3);
    });

    it('should include all required user information in token payload', async () => {
      // Arrange
      const fullUser = { user_id: 5, role: 'hotel_owner' };
      db.User.findByPk.mockResolvedValue(fullUser);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(5);

      // Assert
      const decoded = jwt.verify(result.accessToken, config.jwt.secret);
      expect(decoded).toMatchObject({
        userId: 5,
        role: 'hotel_owner'
      });
    });

    it('should generate tokens that fail verification with wrong secret', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert
      expect(() => {
        jwt.verify(result.accessToken, 'wrong-secret');
      }).toThrow();
    });

    it('should handle concurrent token generation requests', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);

      // Act - Generate multiple tokens concurrently
      const promises = Array(5).fill().map(() => 
        manageTokenService.refreshNewPairTokens(mockUserId)
      );
      const results = await Promise.all(promises);

      // Assert - All tokens should be valid (they may not be unique if generated in same second)
      expect(results.length).toBe(5);

      // All tokens should be valid and decodable
      results.forEach(result => {
        expect(() => jwt.verify(result.accessToken, config.jwt.secret)).not.toThrow();
        expect(() => jwt.verify(result.refreshToken, config.jwt.secret)).not.toThrow();
        
        const decoded = jwt.verify(result.accessToken, config.jwt.secret);
        expect(decoded.userId).toBe(mockUserId);
        expect(decoded.role).toBe('customer');
      });
    });
  });
});
