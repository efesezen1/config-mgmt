var admin = require('firebase-admin')

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : require('../serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

module.exports = admin
