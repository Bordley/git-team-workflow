
cat > src/api/user-controller.js << 'EOF'
const User = require('../models/user');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID utilisateur invalide' });
        }

        const user = await User.findById(parseInt(id));
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        // Ne jamais retourner le mot de passe
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        console.error('getUserById error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { getUserById };
EOF