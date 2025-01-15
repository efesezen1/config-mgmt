const express = require('express')
const admin = require('../config/firebase')
const authenticateJWT = require('../middlewares/authenticateJWT')
const { parameterLimiter } = require('../config/rateLimit')
const router = express.Router()

// Initialize Firestore
const db = admin.firestore()

// Constants
const PARAMETERS_COLLECTION = 'parameters'

// Parameters endpoints with specific rate limit
router.use('/parameters', parameterLimiter)

router.post('/parameters', authenticateJWT, async (req, res) => {
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

      await db.collection(PARAMETERS_COLLECTION).doc(id).set(paramData)

      res.status(201).json({ message: 'Parameter created successfully' })
   } catch (error) {
      console.error('Error creating parameter:', error)
      res.status(500).json({ error: 'Failed to create parameter' })
   }
})

router.put('/parameters/:id', authenticateJWT, async (req, res) => {
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

router.delete('/parameters/:id', authenticateJWT, async (req, res) => {
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

router.put('/parameters/:id/lock', authenticateJWT, async (req, res) => {
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

router.put('/parameters/:id/unlock', authenticateJWT, async (req, res) => {
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

router.get('/client', authenticateJWT, async (req, res) => {
   try {
      const snapshot = await db.collection(PARAMETERS_COLLECTION).get()
      const pair = {}
      const parameters = snapshot.docs.map((doc) => doc.data())
      parameters.forEach((param) => {
         pair[param.key] = param.value
      })
      res.json({ message: pair })
   } catch (error) {
      console.error('Error retrieving parameters:', error)
      res.status(500).json({ error: 'Failed to retrieve parameters' })
   }
})

module.exports = router
