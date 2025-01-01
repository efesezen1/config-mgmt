const rateLimit = require('express-rate-limit')

// Global rate limiter for all routes
const globalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // Limit each IP to 100 requests per windowMs
   message: 'Too many requests from this IP, please try again after 15 minutes',
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Auth specific rate limiter
const authLimiter = rateLimit({
   windowMs: 60 * 60 * 1000, // 1 hour
   max: 15, // Limit each IP to 15 login requests per hour
   message: 'Too many authentication attempts, please try again after an hour',
   standardHeaders: true,
   legacyHeaders: false,
})

// Parameters operations rate limiter
const parameterLimiter = rateLimit({
   windowMs: 60 * 1000, // 1 minute
   max: 30, // Limit each IP to 30 requests per minute
   message: 'Too many parameter operations, please try again after a minute',
   standardHeaders: true,
   legacyHeaders: false,
})

module.exports = {
   globalLimiter,
   authLimiter,
   parameterLimiter,
}
