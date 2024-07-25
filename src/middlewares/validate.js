// middlewares/validate.js

const generateJoiSchema = require('../utils/validation');

/**
 * Middleware to validate request body against a Mongoose schema.
 * @param {Object} mongooseSchema - The Mongoose schema.
 * @returns {Function} - The middleware function.
 */
const validate = (mongooseSchema) => {
  const joiSchema = generateJoiSchema(mongooseSchema);

  return (req, res, next) => {
    console.debug('Validating request body', 2, 'middlewares');
    console.debug(`Request body: ${JSON.stringify(req.body)}`, 3, 'middlewares');

    const { error } = joiSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.debug(`Validation failed: ${error.message}`, 2, 'middlewares');
      return res.status(400).json({ errors: error.details });
    }

    console.debug('Validation passed', 2, 'middlewares');
    next();
  };
};

module.exports = validate;
