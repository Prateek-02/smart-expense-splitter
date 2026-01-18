const { sendError } = require('../utils/responseHandler');

/**
 * Validate request body against schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message).join(', ');
      return sendError(res, errors, 400);
    }

    next();
  };
};

/**
 * Validate request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message).join(', ');
      return sendError(res, errors, 400);
    }

    next();
  };
};

module.exports = {
  validate,
  validateParams,
};
