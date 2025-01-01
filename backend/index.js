const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const admin = require('./config/firebase')
const authenticateJWT = require('./middlewares/authenticateJWT')
const app = express()
const port = process.env.PORT || 3000

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

// Initialize router for v1
const v1Router = express.Router()

// Auth endpoint with specific rate limit
v1Router.post('/auth/token', authLimiter, async (req, res) => {
   try {
      const { uid } = req.body
      if (!uid) {
         return res.status(400).json({ error: 'UID is required' })
      }

      console.log('Creating custom token for UID:', uid)
      const customToken = await admin.auth().createCustomToken(uid)
      console.log('Custom token created:', customToken)
      res.json({ customToken })
   } catch (error) {
      console.error('Error creating custom token:', error)
      res.status(500).json({ error: 'Failed to create custom token' })
   }
})

// Parameters endpoints with specific rate limit
v1Router.use('/parameters', parameterLimiter)

v1Router.post('/parameters', authenticateJWT, async (req, res) => {
   try {
      const { id, key, value, description } = req.body

      // Validate required fields
      if (!id || !key || !value) {
         return res.status(400).json({ error: 'Missing required fields' })
      }

      const paramData = {
         id,
         key,
         value,
         description,
         createdBy: req.user.uid,
         createdAt: admin.firestore.FieldValue.serverTimestamp(),
         isLocked: false,
         lockedBy: null,
         lockedAt: null,
      }

      console.log('Creating parameter:', paramData)
      await db.collection(PARAMETERS_COLLECTION).doc(id).set(paramData)

      res.status(201).json({ message: 'Parameter created successfully' })
   } catch (error) {
      console.error('Error creating parameter:', error)
      res.status(500).json({ error: 'Failed to create parameter' })
   }
})

v1Router.put('/parameters/:id', authenticateJWT, async (req, res) => {
   try {
      const { id } = req.params
      const { key, value, description } = req.body

      // Find the document with matching internal id
      const snapshot = await db
         .collection(PARAMETERS_COLLECTION)
         .where('id', '==', id)
         .get()

      if (snapshot.empty) {
         return res.status(404).json({ error: 'Parameter not found' })
      }

      // Get the first (and should be only) document
      const paramDoc = snapshot.docs[0]

      console.log('Updating parameter:', paramDoc.data())
      // Update fields
      const updateData = {
         key: key || paramDoc.data().key,
         value: value || paramDoc.data().value,
         description: description || paramDoc.data().description,
         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
         lastModifiedBy: req.user.uid,
      }

      await db
         .collection(PARAMETERS_COLLECTION)
         .doc(paramDoc.id)
         .update(updateData)

      res.json({ message: 'Parameter updated successfully' })
   } catch (error) {
      console.error('Error updating parameter:', error)
      res.status(500).json({ error: 'Failed to update parameter' })
   }
})

v1Router.delete('/parameters/:id', authenticateJWT, async (req, res) => {
   try {
      const { id } = req.params

      // Check if parameter exists
      const paramDoc = await db.collection(PARAMETERS_COLLECTION).doc(id).get()

      if (!paramDoc.exists) {
         return res.status(404).json({ error: 'Parameter not found' })
      }

      await db.collection(PARAMETERS_COLLECTION).doc(id).delete()

      res.json({ message: 'Parameter deleted successfully' })
   } catch (error) {
      console.error('Error deleting parameter:', error)
      res.status(500).json({ error: 'Failed to delete parameter' })
   }
})

v1Router.get('/parameters', authenticateJWT, async (req, res) => {
   try {
      console.log('Fetching all parameters')
      const snapshot = await db.collection(PARAMETERS_COLLECTION).get()
      console.log(snapshot)
      const parameters = []
      snapshot.forEach((doc) => {
         parameters.push({
            id: doc.id,
            ...doc.data(),
            createDate: doc.data().createdAt
               ? new Date(doc.data().createdAt._seconds * 1000).toLocaleString()
               : new Date().toLocaleString(),
         })
      })

      console.log('Found parameters:', parameters)
      res.json({ parameters })
   } catch (error) {
      console.error('Error fetching parameters:', error)
      res.status(500).json({ error: 'Failed to fetch parameters' })
   }
})

v1Router.put('/parameters/:id/lock', authenticateJWT, async (req, res) => {
   try {
      const { id } = req.params

      // Find the document with matching internal id
      const snapshot = await db
         .collection(PARAMETERS_COLLECTION)
         .where('id', '==', id)
         .get()

      if (snapshot.empty) {
         return res.status(404).json({ error: 'Parameter not found' })
      }

      const paramDoc = snapshot.docs[0]
      const paramData = paramDoc.data()

      // Check if already locked by someone else
      if (paramData.isLocked && paramData.lockedBy !== req.user.uid) {
         return res.status(403).json({
            error: 'Parameter is already locked by another user',
         })
      }

      // Update with lock information
      await db.collection(PARAMETERS_COLLECTION).doc(paramDoc.id).update({
         isLocked: true,
         lockedBy: req.user.uid,
         lockedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      res.json({ message: 'Parameter locked successfully' })
   } catch (error) {
      console.error('Error locking parameter:', error)
      res.status(500).json({ error: 'Failed to lock parameter' })
   }
})

v1Router.put('/parameters/:id/unlock', authenticateJWT, async (req, res) => {
   try {
      const { id } = req.params

      // Find the document with matching internal id
      const snapshot = await db
         .collection(PARAMETERS_COLLECTION)
         .where('id', '==', id)
         .get()

      if (snapshot.empty) {
         return res.status(404).json({ error: 'Parameter not found' })
      }

      const paramDoc = snapshot.docs[0]
      const paramData = paramDoc.data()

      // Only the user who locked it can unlock it
      if (paramData.lockedBy !== req.user.uid) {
         return res.status(403).json({
            error: 'Only the user who locked the parameter can unlock it',
         })
      }

      // Remove lock
      await db.collection(PARAMETERS_COLLECTION).doc(paramDoc.id).update({
         isLocked: false,
         lockedBy: null,
         lockedAt: null,
      })

      res.json({ message: 'Parameter unlocked successfully' })
   } catch (error) {
      console.error('Error unlocking parameter:', error)
      res.status(500).json({ error: 'Failed to unlock parameter' })
   }
})

// Mount v1 router
app.use('/api/v1', v1Router)

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack)
   res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(port, () => {
   console.log(`Server running on port ${port}`)
})
