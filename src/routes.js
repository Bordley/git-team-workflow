
cat > src/routes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { login } = require('./api/auth-controller');
const { authenticate } = require('./middleware/auth');

// Routes publiques
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/auth/login', login);

// Routes protégées (exemple)
router.get('/protected', authenticate, (req, res) => {
    res.json({ message: `Bonjour ${req.user.email}` });
});

module.exports = router;
EOF