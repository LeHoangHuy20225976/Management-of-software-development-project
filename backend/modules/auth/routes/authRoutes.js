const express = require("express");

const middlewares = require("../../../kernels/middlewares");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");
const { validate } = require("../../../kernels/validations");
const authValidation = require("../../../kernels/validations/authValidation");

const authController = require("../controller/authController");
const manageTokenController = require("../controller/manageTokenController");

const router = express.Router();

router.post("/login", validate([authValidation.login]), authController.login);
router.post(
  "/register",
  validate([authValidation.register]),
  authController.register
);
router.post("/refresh-tokens", manageTokenController.refreshTokens);
router.post("/logout", middlewares([authMiddleware]), authController.logout);
router.post(
  "/verify-forget-password",
  validate([authValidation.verifyForgetPassword]),
  authController.verifyResetForgetPassword
);
router.post(
  "/reset-password",
  middlewares([authMiddleware]),
  validate([authValidation.resetPassword]),
  authController.resetPassword
);
router.post(
  "/reset-forget-password",
  validate([authValidation.resetForgetPassword]),
  authController.resetForgetPassword
);

module.exports = router;

