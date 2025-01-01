const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const admin = require('./config/firebase');

const { globalLimiter } = require('./config/rateLimit');
const v1Routes = require('./routes/v1');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firestore
const db = admin.firestore()


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
