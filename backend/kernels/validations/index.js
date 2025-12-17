const { validationResult } = require("express-validator");
const response = require("../../utils/responseUtils");

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
        // express-validator chains are context runners and expose `.run(req)` in v6+.
        // Older patterns may have `.get().run(req)`, so support both.
        if (typeof _validation?.run === "function") {
          await _validation.run(req);
          continue;
        }
        if (typeof _validation?.get === "function") {
          const runner = _validation.get();
          await runner.run(req);
          continue;
        }
        throw new TypeError("Invalid validation chain provided to validate()");
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
