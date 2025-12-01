const { validationResult } = require("express-validator");
const response = require("utils/responseUtils");

const formattedValidationResult = validationResult.withDefaults({
  formatter: (error) => ({
    field: error.path,
    message: error.msg,
  }),
});

const validate = (validationArray) => {
  return async (req, res, next) => {
    for (let validation of validationArray) {
      for (let _validation of validation) {
        await _validation.get().run(req);
      }
    }

    const errors = formattedValidationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return response.invalidated(res, {
      errors: errors.array(),
    });
  };
};

module.exports = { validate };
