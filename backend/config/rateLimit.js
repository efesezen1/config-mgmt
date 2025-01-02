const rateLimit = require('express-rate-limit')

// Global rate limiter for all routes
const globalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // Limit each IP to 100 requests per windowMs
   message: 'Too many requests from this IP, please try again after 15 minutes',
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
   parameterLimiter,
}
