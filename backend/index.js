const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const firebaseApp = require('./config/firebase')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Test Firebase connection
app.get('/', async (req, res) => {
   try {
      // Test Firebase connection by listing users (requires proper permissions)
      await firebaseApp.auth().listUsers(1)
      res.send('Firebase connection successful!')
   } catch (error) {
      console.error('Firebase connection error:', error)
      res.status(500).send('Firebase connection failed: ' + error.message)
   }
})

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
})

