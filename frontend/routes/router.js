const express = require('express');
const router = express.Router();

// Define routes here
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Example route with parameters
router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.json({ message: `Requested ID: ${id}` });
});

// POST example
router.post('/', (req, res) => {
    res.json({ message: 'POST request received', data: req.body });
});

module.exports = router;
