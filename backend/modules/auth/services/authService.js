const { sign, signRefreshToken } = require("../../../utils/jwtUtils");
const bcrypt = require("bcryptjs");
const db = require("../../../models/index");
const { Op } = require("sequelize");
const express = require("express");
const redis = require("../../../utils/redisClient");
const nodemailer = require("nodemailer");

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
        const accessToken = sign(user.user_id, user.role);
        const refreshToken = signRefreshToken(user.user_id, user.role);
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
    },
    async resetPassword(userId, currentPassword, newPassword, confirmNewPassword) {
        const user = await db.User.findByPk(userId);
        if (!user) {
            throw new Error("User not found");
        }
        let isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }
        if (newPassword !== confirmNewPassword) {
            throw new Error("New password and confirm new password do not match");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return { message: "Password reset successfully" };
    },
    async resetForgetPassword(email, newPassword, token) {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            throw new Error("User not found.");
        }
        const storedToken = await redis.get(email);
        if (!storedToken) {
            throw new Error("Invalid or expired token.");
        }
        if (storedToken !== token) {
            throw new Error("Token mismatch.");
        }
        const hashed_password = await bcrypt.hash(newPassword, 10);
        user.hashed_password = hashed_password;
        await redis.del(email);
        await user.save();
        return { message: "Password reset successfully." };
    },
    async genOTP() {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp;
    },
    async sendOTP(email, otp) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER || "duckcode145@gmail.com",
                pass: process.env.APP_PASS,
            },
        });
        const mailOptions = {
            from: process.env.GMAIL_USER || "duckcode145@gmail.com",
            to: email,
            subject: "OTP for email vertification",
            text: `Your OTP is: ${otp}, valid for 5 minutes.`,
        };
        return transporter.sendMail(mailOptions);
    },

    async verifyForgetPassword(email) {
        const user = await db.User.findOne({ where: { email } });
        if (!user || user.status !== config.config.statusenum.AUTHENTICATED) {
            throw new Error("User not found or not authenticated.");
        }
        await redis.del(email);
        const base_url = process.env.RESET_PASSWORD_URL || 'http://localhost:4200/auth/reset-password?token=';
        const otp = await this.genOTP();
        await redis.set(email, otp, { EX: 300 }); // 300s = 5 minutes
        const resetLink = `${base_url}${otp}`;
        await this.sendOTP(email, resetLink);
        console.log("Password reset link sent successfully");
        return { message: "Password reset link sent to email, please use this link to access the reset page." };
    },
}
module.exports = authService;