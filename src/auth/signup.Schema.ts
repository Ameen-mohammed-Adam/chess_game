import Joi from 'joi';

export const SignUpSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email({}).required(),
  password: Joi.string().required(),
  rating: Joi.string().required(),
});
