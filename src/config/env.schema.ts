import * as Joi from 'joi';


export const envSchema = Joi.object({
    MONGODB_URI: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    POSTGRES_URI: Joi.string().required(),
    FRONTEND_URL: Joi.string().uri().default('http://localhost:4200'),
    PORT: Joi.number().default(3000),
    COOKIE_DOMAIN: Joi.string().optional() // e.g., '.yourdomain.com' for production
})