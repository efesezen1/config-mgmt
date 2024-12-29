const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const admin = require('./config/firebase')
const app = express()
const port = 3000

const db = admin.firestore()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Middleware to verify Firebase ID token
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Unauthorized - No token provided'});
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Decoded token:', decodedToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({error: 'Unauthorized - Invalid token'});
    }
};

// Generate custom token endpoint
app.post('/api/auth/token', async (req, res) => {
    try {
        const {uid} = req.body;

        if (!uid) {
            return res.status(400).json({error: 'UID is required'});
        }

        // Add additional claims for the user
        const additionalClaims = {
            premiumAccount: true,
            role: 'user'
        };

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        res.json({customToken});
    } catch (error) {
        console.error('Error creating custom token:', error);
        res.status(500).json({error: 'Failed to create custom token'});
    }
});

app.get('/api/test', (req, res) => {
    res.send('Hello World!')
})

// Test Firebase connection
app.get('/', async (req, res) => {
    try {
        // Test Firebase connection by listing users (requires proper permissions)
        await admin.auth().listUsers(1)
        res.send('Firebase connection successful!')
    } catch (error) {
        console.error('Firebase connection error:', error)
        res.status(500).send('Internal server error')
    }
})

// Protected route example - requires authentication
app.post('/api/create', authenticateJWT, async (req, res) => {
    try {
        const {id, key, value, description} = req.body
        await db.collection('parameters').doc(`/${id}/`).set({
            id,
            key,
            value,
            description,
            userId: req.user.uid, // Add user ID from the verified token
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
        res.status(201).send('Parameter created successfully!')
    } catch (error) {
        console.error('Error creating parameter:', error)
        res.status(500).send('Internal server error')
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
