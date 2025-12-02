const manageTokenService = require('../services/manageTokenService');
const responseUtils = require("../../../utils/responseUtils");
const jwt = require('jsonwebtoken');
const config = require("../../../configs/index");
const manageTokenController = {
    refreshTokens: async (req, res) => {
        try {
            console.log("Refreshing tokens...", req);
            const refreshToken = req.cookies?.refreshToken;
            console.log("Received refresh token: ", refreshToken);
            if (!refreshToken) {
                return responseUtils.unauthorized(res, "Unauthorized, Please login again");
            }
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, config.jwt.secret);
                // console.log("Decoded refresh token: ", decoded);
            } catch (err) {
                return responseUtils.unauthorized(res, "Invalid refresh token, Please login again");
            }
            const userId = decoded.userId;
            const tokens = await manageTokenService.refreshNewPairTokens(userId);
            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 3600000, // 1 hour
            });
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 604800000, // 1 week
            });
            responseUtils.ok(res, { message: "Tokens refreshed successfully" });
        } catch (error) {  
            responseUtils.error(res, error.message);
        }
    } 
}
module.exports = manageTokenController;