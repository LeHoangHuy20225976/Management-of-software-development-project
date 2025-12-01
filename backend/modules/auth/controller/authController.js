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
            const userData = req.body.userData;
            const data = await authService.register(userData);
            return responseUtils.ok(res, data);
        } catch (error) {
            if(error.message === "User with this email already exists") {
                return responseUtils.unauthorized(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }
    }
};
module.exports = authController;


