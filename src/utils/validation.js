// utils/validation.js

const Joi = require('joi');

/**
 * Generate a Joi validation schema from a Mongoose schema.
 * @param {Object} mongooseSchema - The Mongoose schema.
 * @returns {Object} - The Joi validation schema.
 */
const generateJoiSchema = (mongooseSchema) => {
  const joiSchema = {};

  mongooseSchema.eachPath((path, schemaType) => {
    if (schemaType.isRequired) {
      switch (schemaType.instance) {
        case 'String':
          joiSchema[path] = Joi.string().required();
          break;
        case 'Number':
          joiSchema[path] = Joi.number().required();
          break;
        case 'Boolean':
          joiSchema[path] = Joi.boolean().required();
          break;
        case 'Date':
          joiSchema[path] = Joi.date().required();
          break;
        default:
          joiSchema[path] = Joi.any().required();
      }
    }
  });

  return Joi.object(joiSchema);
};

module.exports = generateJoiSchema;
