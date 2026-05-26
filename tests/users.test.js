
cat > tests/users.test.js << 'EOF'
const request = require('supertest');
const app = require('../src/app');

describe('GET /users/:id', () => {
    it('retourne 400 si ID invalide', async () => {
        const res = await request(app).get('/users/abc');
        expect(res.status).toBe(400);
    });

    it('retourne 404 si utilisateur inexistant', async () => {
        const res = await request(app).get('/users/99999');
        expect(res.status).toBe(404);
    });

    it('retourne le profil sans le mot de passe', async () => {
        const res = await request(app).get('/users/1');
        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty('password_hash');
    });
});
EOF