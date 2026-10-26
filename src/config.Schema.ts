import Joi from 'joi';

export const configValidationSchema = Joi.object({
  STAGE: Joi.string().required(),
  DB_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRESIN: Joi.string().required(),
  BCRYPT_SALT: Joi.number().required(),
  IMAGEKIT_PRIVATE_KEY: Joi.string().required(),
});
