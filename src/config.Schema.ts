import Joi from 'joi';

export const configValidationSchema = Joi.object({
  STAGE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWOR: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRESIN: Joi.string().required(),
  BCRYPT_SALT: Joi.number().required(),
  IMAGEKIT_PRIVATE_KEY: Joi.string().required(),
});
