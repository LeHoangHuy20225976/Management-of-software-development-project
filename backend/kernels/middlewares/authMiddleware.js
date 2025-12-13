const jwt = require('jsonwebtoken');
const config = require('../../configs/index');
const responseUtils = require("../../utils/responseUtils");
const db = require('../../models/index');
// const manageTokenServices = require('modules/manage_token/services/manageTokenService');

const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return responseUtils.unauthorized(res, "No access token provided");
        } 
        let decoded;
        try {
            decoded = jwt.verify(accessToken, config.jwt.secret);
        } catch (err) {
            return responseUtils.unauthorized(res, "Invalid access token");
        }
        const user = await db.User.findByPk(decoded.userId, { where: { role: decoded.role } });
        if (!user) {
            return responseUtils.unauthorized(res, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        return responseUtils.error(res, error.message);
    }
};
module.exports = authMiddleware;