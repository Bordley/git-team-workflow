
cat > src/middleware/auth.js << 'EOF'
// Middleware d'authentification — à implémenter
const authenticate = (req, res, next) => {
    next(); // temporaire — pas d'auth pour l'instant
};

module.exports = { authenticate };
EOF