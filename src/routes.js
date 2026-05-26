
cat > src/routes.js << 'EOF'
const express = require('express');
const router = express.Router();

// Routes de base
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
EOF