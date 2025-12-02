const db = require("../../../models/index");
const { sign, signRefreshToken } = require("../../../utils/jwtUtils");
const express = require("express");
require("dotenv").config();

const manageTokenService = {
    async refreshNewPairTokens(userId) {
        const user = await db.User.findByPk(userId, {
            attributes: ['user_id', 'role']
        });
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = sign(user.user_id, user.role);
        const refreshToken = signRefreshToken(user.user_id, user.role);
        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }
}
module.exports = manageTokenService;