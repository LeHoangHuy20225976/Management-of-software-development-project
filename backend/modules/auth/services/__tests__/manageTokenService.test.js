const manageTokenService = require('../manageTokenService');
const { sign, signRefreshToken } = require('utils/jwtUtils');

// Mock dependencies
jest.mock('models/index', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

jest.mock('utils/jwtUtils', () => ({
  sign: jest.fn(),
  signRefreshToken: jest.fn()
}));

const db = require('models/index');

describe('ManageTokenService - Unit Tests', () => {
  describe('refreshNewPairTokens', () => {
    const mockUserId = 1;
    const mockUser = {
      user_id: 1,
      role: 'customer'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should successfully refresh tokens for valid user', async () => {
      // Arrange
      const mockAccessToken = 'new-access-token';
      const mockRefreshToken = 'new-refresh-token';

      db.User.findByPk.mockResolvedValue(mockUser);
      sign.mockReturnValue(mockAccessToken);
      signRefreshToken.mockReturnValue(mockRefreshToken);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert
      expect(db.User.findByPk).toHaveBeenCalledWith(mockUserId, {
        attributes: ['user_id', 'role']
      });
      expect(sign).toHaveBeenCalledWith(mockUser.user_id, mockUser.role);
      expect(signRefreshToken).toHaveBeenCalledWith(mockUser.user_id, mockUser.role);
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(manageTokenService.refreshNewPairTokens(mockUserId))
        .rejects
        .toThrow('User not found');

      expect(db.User.findByPk).toHaveBeenCalledWith(mockUserId, {
        attributes: ['user_id', 'role']
      });
      expect(sign).not.toHaveBeenCalled();
      expect(signRefreshToken).not.toHaveBeenCalled();
    });

    it('should handle different user roles correctly', async () => {
      // Arrange
      const adminUser = { user_id: 2, role: 'admin' };
      const mockAccessToken = 'admin-access-token';
      const mockRefreshToken = 'admin-refresh-token';

      db.User.findByPk.mockResolvedValue(adminUser);
      sign.mockReturnValue(mockAccessToken);
      signRefreshToken.mockReturnValue(mockRefreshToken);

      // Act
      const result = await manageTokenService.refreshNewPairTokens(2);

      // Assert
      expect(sign).toHaveBeenCalledWith(adminUser.user_id, 'admin');
      expect(signRefreshToken).toHaveBeenCalledWith(adminUser.user_id, 'admin');
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      });
    });

    it('should call findByPk with correct attributes', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);
      sign.mockReturnValue('token');
      signRefreshToken.mockReturnValue('refresh-token');

      // Act
      await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert
      expect(db.User.findByPk).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          attributes: expect.arrayContaining(['user_id', 'role'])
        })
      );
    });

    it('should propagate database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      db.User.findByPk.mockRejectedValue(dbError);

      // Act & Assert
      await expect(manageTokenService.refreshNewPairTokens(mockUserId))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should return both tokens with correct structure', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(mockUser);
      sign.mockReturnValue('access-123');
      signRefreshToken.mockReturnValue('refresh-456');

      // Act
      const result = await manageTokenService.refreshNewPairTokens(mockUserId);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });
  });
});
