const { body } = require('express-validator');

const authValidation = {
  login: [
    body('userData.email').notEmpty().isEmail().withMessage('Email is required'),
    body('userData.password').notEmpty().withMessage('Password is required'),
    body('userData.role').notEmpty().withMessage('Role is required'),
  ],

  register: [
    body('userData.name').notEmpty().withMessage('Name is required'),
    body('userData.email').notEmpty().isEmail().withMessage('Valid email is required'),
    body('userData.phone_number').notEmpty().withMessage('Phone number is required'),
    body('userData.gender').notEmpty().withMessage('Gender is required'),
    body('userData.date_of_birth').notEmpty().withMessage('Date of birth is required'),
    body('userData.role').notEmpty().withMessage('Role is required'),
    body('userData.password').notEmpty().isLength({ min: 6 }).withMessage('Password is required'),
    body('userData.profile_image').optional(),
  ],

  resetPassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password is required'),
    body('confirmNewPassword')
      .notEmpty()
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Confirm password must match new password'),
  ],

  verifyForgetPassword: [
    body('email').notEmpty().isEmail().withMessage('Email is required'),
  ],

  resetForgetPassword: [
    body('email').notEmpty().isEmail().withMessage('Email is required'),
    body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password is required'),
    body('newPasswordConfirm')
      .notEmpty()
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Confirm password must match new password'),
    body('token').notEmpty().withMessage('Token is required'),
  ],
};

module.exports = authValidation;
