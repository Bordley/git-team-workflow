const { generateToken, verifyPassword } = require('../services/auth-service');
const User = require('../models/user');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email et mot de passe requis'
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            // Message générique intentionnel : évite l'énumération des comptes
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            // Même message que ci-dessus — un attaquant ne peut pas
            // distinguer "email inexistant" de "mauvais mot de passe"
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const token = generateToken(user);
        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { login };
