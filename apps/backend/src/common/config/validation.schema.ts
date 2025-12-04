import Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_EXPIRATION_SECONDS: Joi.number().integer().positive().required(),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().integer().positive().required(),
  JWT_SECRET: Joi.string().min(32).required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
});
