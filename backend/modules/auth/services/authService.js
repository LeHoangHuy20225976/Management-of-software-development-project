const { sign, signRefreshToken } = require("../../../utils/jwtUtils");
const bcrypt = require("bcryptjs");
const db = require("../../../models/index");
const { Op } = require("sequelize");
const express = require("express");
require("dotenv").config();
const config = require("../../../configs/index");

const INVALID_CREDENTIALS = "Username or password is incorrect";
const authService = {
    async login(userData) {
        const { email, password, role} = userData;
        const user = await db.User.findOne({
            where: {
                [Op.and]: [
                    { email: email },
                    { role: role }
                ]
            }
        });
        if (!user) {
            throw new Error(INVALID_CREDENTIALS);
        }
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error(INVALID_CREDENTIALS);
        }
        const accessToken = sign({ user_id: user.user_id, role: user.role });
        const refreshToken = signRefreshToken({ user_id: user.user_id, role: user.role });
        return {
            user: {
                user_id: user.user_id,
                name: user.name,
                gender: user.gender,
                role: user.role,
                profile_image: user.profile_image

            },
            accessToken: accessToken,
            refreshToken: refreshToken,       
        }
    },
    async register(userData) {
        const {name, email, phone_number, gender, date_of_birth, role, password, profile_image} = userData;
        // check if user already exists by using email
        const existingUser = await db.User.findOne({ where: { email: email } });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.User.create({
            name,
            email,
            phone_number,
            gender,
            date_of_birth,
            role,
            password: hashedPassword,
            profile_image
        });
        return {
            email: newUser.email,
        }
    }
}
module.exports = authService;