const express = require('express');
const router = express.Router();
const { login } = require('./api/auth-controller');
const { authenticate } = require('./middleware/auth');
const { getUserById } = require('./api/user-controller');

// Routes publiques
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/auth/login', login);

// User routes (protégées par JWT)
router.get('/users/:id', authenticate, getUserById);

// Exemple route protégée
router.get('/protected', authenticate, (req, res) => {
    res.json({ message: `Bonjour ${req.user.email}` });
});

module.exports = router;
