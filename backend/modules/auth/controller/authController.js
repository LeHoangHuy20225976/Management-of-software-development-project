const responseUtils = require("../../../utils/responseUtils");
const authService = require("../services/authService");

const authController = {
    login: async (req, res) => {
        try {
            console.log(req.body);
            const userData = req.body.userData;
            console.log("Login attempt for user: ", userData);
            const data = await authService.login(
                userData
            );
            res.cookie("accessToken", data.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 3600000, // 1 hour
            });
            res.cookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 604800000, // 1 week
            });
            return responseUtils.ok(res, data.user);
        } catch (error) {
            console.error("Login error: ", error);
            if(error.message === "Username or password is incorrect") {
                return responseUtils.unauthorized(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }
    },
    register: async (req, res) => {
        try {
            console.log("REGISTER IS CALLED");
            const userData = req.body.userData;
            console.log("Register attempt for user: ", userData);
            const data = await authService.register(userData);
            return responseUtils.ok(res, data);
        } catch (error) {
            if(error.message === "User with this email already exists") {
                return responseUtils.unauthorized(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return responseUtils.ok(res, { message: "Logged out successfully" });
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    resetPassword: async (req, res) => {
        try {
            userId = req.user.user_id;
            const {currentPassword, newPassword, confirmNewPassword} = req.body;
            const data = await authService.resetPassword(userId, currentPassword, newPassword, confirmNewPassword);
            return responseUtils.ok(res, data);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    verifyResetForgetPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return responseUtils.error(res, { message: "Email is required" });
            }
            // console.log("It is called");
            const data = await authService.verifyForgetPassword(email);
            return responseUtils.ok(res, {  message: data.message });
            } catch (error) {
            console.error("Verify Reset Password error:", error);
            return responseUtils.unauthorized(res, error.message);
        }
    },
    async resetForgetPassword(req, res) {
        try {
            const {email, newPassword, newPasswordConfirm, token} = req.body;
            if(!email || !newPassword || !newPasswordConfirm || !token) {
                return responseUtils.error(res, { message: "Email, new password, confirm new password and token are required" });
            }
            if(newPassword !== newPasswordConfirm) {
                return responseUtils.error(res, { message: "New password and confirm new password do not match" });
            }
            await authService.resetForgetPassword(email, newPassword, token);
            return responseUtils.ok(res, { message: "Password reset successfully" });
        } catch (error) {
            console.error("Reset Password error:", error);
            return responseUtils.unauthorized(res, error.message);
        }
    },

};
module.exports = authController;
