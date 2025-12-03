const manageTokenController = require('../manageTokenController');
const manageTokenService = require('../../services/manageTokenService');
const responseUtils = require('utils/responseUtils');
const jwt = require('jsonwebtoken');
const config = require('configs/index');

// Mock dependencies
jest.mock('../../services/manageTokenService');
jest.mock('utils/responseUtils');
jest.mock('jsonwebtoken');
jest.mock('configs/index', () => ({
  jwt: {
    secret: 'test-secret'
  }
}));

describe('ManageTokenController - Unit Tests', () => {
  describe('refreshTokens', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();

      // Setup mock request and response
      mockReq = {
        cookies: {
          refreshToken: 'valid-refresh-token'
        }
      };

      mockRes = {
        cookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Mock console.log to avoid cluttering test output
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should successfully refresh tokens with valid refresh token', async () => {
      // Arrange
      const mockDecoded = { userId: 1, role: 'customer' };
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      jwt.verify.mockReturnValue(mockDecoded);
      manageTokenService.refreshNewPairTokens.mockResolvedValue(mockTokens);
      responseUtils.ok.mockImplementation((res, data) => res.json(data));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', config.jwt.secret);
      expect(manageTokenService.refreshNewPairTokens).toHaveBeenCalledWith(1);
      
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', 'new-access-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000
      });
      
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 604800000
      });

      expect(responseUtils.ok).toHaveBeenCalledWith(mockRes, { 
        message: 'Tokens refreshed successfully' 
      });
    });

    it('should return unauthorized when refresh token is missing', async () => {
      // Arrange
      mockReq.cookies = {};
      responseUtils.unauthorized.mockImplementation((res, msg) => res.json({ message: msg }));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(responseUtils.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Unauthorized, Please login again'
      );
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(manageTokenService.refreshNewPairTokens).not.toHaveBeenCalled();
    });

    it('should return unauthorized when refresh token is invalid', async () => {
      // Arrange
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      responseUtils.unauthorized.mockImplementation((res, msg) => res.json({ message: msg }));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', config.jwt.secret);
      expect(responseUtils.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Invalid refresh token, Please login again'
      );
      expect(manageTokenService.refreshNewPairTokens).not.toHaveBeenCalled();
    });

    it('should return unauthorized when refresh token is expired', async () => {
      // Arrange
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });
      responseUtils.unauthorized.mockImplementation((res, msg) => res.json({ message: msg }));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(responseUtils.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Invalid refresh token, Please login again'
      );
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const mockDecoded = { userId: 1, role: 'customer' };
      jwt.verify.mockReturnValue(mockDecoded);
      manageTokenService.refreshNewPairTokens.mockRejectedValue(
        new Error('User not found')
      );
      responseUtils.error.mockImplementation((res, msg) => res.json({ message: msg }));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(responseUtils.error).toHaveBeenCalledWith(mockRes, 'User not found');
    });

    it('should handle cookies being undefined', async () => {
      // Arrange
      mockReq.cookies = undefined;
      responseUtils.unauthorized.mockImplementation((res, msg) => res.json({ message: msg }));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(responseUtils.unauthorized).toHaveBeenCalledWith(
        mockRes,
        'Unauthorized, Please login again'
      );
    });

    it('should set cookies with correct options', async () => {
      // Arrange
      const mockDecoded = { userId: 1, role: 'customer' };
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      jwt.verify.mockReturnValue(mockDecoded);
      manageTokenService.refreshNewPairTokens.mockResolvedValue(mockTokens);

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      
      // Check access token cookie options
      const accessTokenCall = mockRes.cookie.mock.calls[0];
      expect(accessTokenCall[0]).toBe('accessToken');
      expect(accessTokenCall[2]).toMatchObject({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000 // 1 hour
      });

      // Check refresh token cookie options
      const refreshTokenCall = mockRes.cookie.mock.calls[1];
      expect(refreshTokenCall[0]).toBe('refreshToken');
      expect(refreshTokenCall[2]).toMatchObject({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 604800000 // 1 week
      });
    });

    it('should extract userId from decoded token correctly', async () => {
      // Arrange
      const mockDecoded = { userId: 42, role: 'admin' };
      const mockTokens = {
        accessToken: 'token1',
        refreshToken: 'token2'
      };

      jwt.verify.mockReturnValue(mockDecoded);
      manageTokenService.refreshNewPairTokens.mockResolvedValue(mockTokens);

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(manageTokenService.refreshNewPairTokens).toHaveBeenCalledWith(42);
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const mockDecoded = { userId: 1, role: 'customer' };
      jwt.verify.mockReturnValue(mockDecoded);
      manageTokenService.refreshNewPairTokens.mockRejectedValue(
        new Error('Database connection failed')
      );
      responseUtils.error.mockImplementation((res, msg) => res.json({ message: msg }));

      // Act
      await manageTokenController.refreshTokens(mockReq, mockRes);

      // Assert
      expect(responseUtils.error).toHaveBeenCalledWith(
        mockRes,
        'Database connection failed'
      );
    });
  });
});
