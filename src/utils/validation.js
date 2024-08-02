// utils/validation.js

const Joi = require('joi');

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
    } else {
      switch (schemaType.instance) {
        case 'String':
          joiSchema[path] = Joi.string().optional();
          break;
        case 'Number':
          joiSchema[path] = Joi.number().optional();
          break;
        case 'Boolean':
          joiSchema[path] = Joi.boolean().optional();
          break;
        case 'Date':
          joiSchema[path] = Joi.date().optional();
          break;
        default:
          joiSchema[path] = Joi.any().optional();
      }
    }
  });

  // Allow MongoDB and Mongoose specific fields
  return Joi.object(joiSchema).unknown(true).keys({
    _id: Joi.any(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
    __v: Joi.number()
  });
};

module.exports = generateJoiSchema;
