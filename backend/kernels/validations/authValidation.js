const { body } = require('express-validator');
const ALLOWED_ROLES = ['customer', 'hotel_manager', 'admin'];

// Wrapper so the validator matches index.js expectation of .get().run(req)
const wrap = (chain) => ({ get: () => chain });

const authValidation = {
  login: [
    wrap(body('userData.email').notEmpty().isEmail().withMessage('Email is required')),
    wrap(body('userData.password').notEmpty().withMessage('Password is required')),
    wrap(
      body('userData.role')
        .notEmpty().withMessage('Role is required')
        .isIn(ALLOWED_ROLES).withMessage(`Role is not valid`)
    ),
  ],

  register: [
    wrap(body('userData.name').notEmpty().withMessage('Name is required')),
    wrap(body('userData.email').notEmpty().isEmail().withMessage('Valid email is required')),
    wrap(body('userData.phone_number').notEmpty().withMessage('Phone number is required')),
    wrap(body('userData.gender').notEmpty().withMessage('Gender is required')),
    wrap(body('userData.date_of_birth').notEmpty().withMessage('Date of birth is required')),
    wrap(
      body('userData.role')
        .notEmpty().withMessage('Role is required')
        .isIn(ALLOWED_ROLES).withMessage(`Role is not valid`)
    ),
    wrap(body('userData.password').notEmpty().isLength({ min: 6 }).withMessage('Password is required')),
    wrap(body('userData.profile_image').optional()),
  ],

  resetPassword: [
    wrap(body('currentPassword').notEmpty().withMessage('Current password is required')),
    wrap(body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password is required')),
    wrap(
      body('confirmNewPassword')
        .notEmpty()
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Confirm password must match new password')
    ),
  ],

  verifyForgetPassword: [
    wrap(body('email').notEmpty().isEmail().withMessage('Email is required')),
  ],

  resetForgetPassword: [
    wrap(body('email').notEmpty().isEmail().withMessage('Email is required')),
    wrap(body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password is required')),
    wrap(
      body('newPasswordConfirm')
        .notEmpty()
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Confirm password must match new password')
    ),
    wrap(body('token').notEmpty().withMessage('Token is required')),
  ],
};

module.exports = authValidation;
