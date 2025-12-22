import Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_EXPIRATION_SECONDS: Joi.number().integer().positive().required(),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().integer().positive().required(),
  JWT_SECRET: Joi.string().min(32).required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  AWS_REGION: Joi.string().required(),
  AWS_S3_ACCESS_KEY: Joi.string().required(),
  AWS_S3_SECRET_KEY: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),

  SESSION_SECRET: Joi.string().required(),

  FRONTEND_URL: Joi.string().uri().required(),
  FRONTEND_FORGOT_PASSWORD_PATH: Joi.string().required(),

  RESEND_API_KEY: Joi.string().required(),

  CORS_ORIGIN: Joi.string().required(), // one or multiple urls separated by a comma

  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(8).required(),
});
