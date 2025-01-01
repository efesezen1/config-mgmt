const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const admin = require('./config/firebase');
const authenticateJWT = require('./middlewares/authenticateJWT');
const v1Routes = require('./routes/v1');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firestore
const db = admin.firestore()

// Constants
const PARAMETERS_COLLECTION = 'parameters'

// Rate Limiters
const globalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // Limit each IP to 100 requests per windowMs
   message: 'Too many requests from this IP, please try again after 15 minutes',
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const authLimiter = rateLimit({
   windowMs: 60 * 60 * 1000, // 1 hour
   max: 15, // Limit each IP to 5 login requests per hour
   message: 'Too many authentication attempts, please try again after an hour',
   standardHeaders: true,
   legacyHeaders: false,
})

const parameterLimiter = rateLimit({
   windowMs: 60 * 1000, // 1 minute
   max: 30, // Limit each IP to 30 requests per minute
   message: 'Too many parameter operations, please try again after a minute',
   standardHeaders: true,
   legacyHeaders: false,
})

// Middleware
app.use(
   cors({
      origin: ['https://cwconfigpanel.netlify.app/', 'http://localhost:5173'],
      credentials: true,
   })
)
app.use(express.json())
app.use(morgan('dev'))

// Apply global rate limiter
app.use(globalLimiter)

// Apply v1 routes
app.use('/api/v1', v1Routes)

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack)
   res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(port, () => {
   console.log(`Server running on port ${port}`)
})
