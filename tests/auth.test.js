
cat > tests/auth.test.js << 'EOF'
const request = require('supertest');
const app = require('../src/app');

describe('POST /auth/login', () => {
    it('retourne 400 si email manquant', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ password: 'secret' });
        expect(res.status).toBe(400);
    });

    it('retourne 401 si identifiants invalides', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'inexistant@test.com', password: 'wrong' });
        expect(res.status).toBe(401);
    });

    it('retourne un token JWT si identifiants valides', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'alice@test.com', password: 'correct-password' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
    });
});
EOF