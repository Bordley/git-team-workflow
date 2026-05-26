
# 🔀 Git Team Workflow — Full Simulation with Branches, PRs & Conflict Resolution

> A hands-on learning project that simulates a real development team workflow:  
> two developers, two parallel features, a PR review, and a Git conflict resolved cleanly.

---

## 📌 Who is this for?

Any beginner or intermediate developer who wants to understand **how Git works in a team** — not just `git add` and `git commit`, but the real professional workflow: branches, Pull Requests, code review, rebase, and conflict resolution.

---

## 🧰 Prerequisites

- Git installed (`git --version`)
- Node.js LTS installed (`node --version`) — recommended via [nvm](https://github.com/nvm-sh/nvm)
- Basic JavaScript knowledge

---

## 🏗️ Project Structure

```
api-project/
├── src/
│   ├── api/
│   │   ├── auth-controller.js     → POST /auth/login endpoint logic
│   │   └── user-controller.js     → GET /users/:id endpoint logic
│   ├── middleware/
│   │   └── auth.js                → JWT verification middleware
│   ├── models/                    → data models (User, etc.)
│   ├── services/
│   │   └── auth-service.js        → JWT generation/verification, bcrypt
│   ├── app.js                     → Express entry point
│   └── routes.js                  → all route definitions
└── tests/
    ├── auth.test.js               → authentication module tests
    └── users.test.js              → user profile module tests
```

---

## 🌊 Workflow: GitHub Flow

```
main (stable, always deployable)
 │
 ├── feature/PROJ-101-user-authentication   ← Alice
 │        ↓ PR #1 → review → merge
 │
 └── feature/PROJ-102-user-profile          ← Bob
          ↓ conflict on routes.js → rebase → resolution → PR #2 → merge
```

**GitHub Flow rules:**
1. `main` is always stable and deployable
2. Every new feature lives on a dedicated branch
3. Open a Pull Request to merge back
4. Code is peer-reviewed before merging
5. Only merge if all tests pass

---

## 📖 Full Project Walkthrough

### Phase 1 — Initialization

The lead sets up the project structure and makes the first commit on `main`.

```bash
mkdir api-project && cd api-project
git init
mkdir -p src/{api,middleware,models,services} tests
touch src/routes.js src/app.js src/middleware/auth.js
git add .
git commit -m "chore: initialize API project structure"
```

> **Conventional Commits**: the `type(scope): description` format standardizes commit messages.  
> Common types: `feat` (new feature), `fix` (bug fix), `chore` (maintenance), `test` (tests), `refactor`.

---

### Phase 2 — Alice implements JWT authentication

Alice creates her branch from `main` and works independently.

```bash
git switch -c feature/PROJ-101-user-authentication
```

She develops 4 elements in separate commits:

| Commit | File | Responsibility |
|--------|------|----------------|
| `feat(auth): JWT middleware` | `src/middleware/auth.js` | Verifies Bearer token |
| `feat(auth): auth service` | `src/services/auth-service.js` | JWT generation/verification + bcrypt |
| `feat(auth): login controller` | `src/api/auth-controller.js` | POST /auth/login logic |
| `feat(auth): routes` | `src/routes.js` | Registers routes |

**Best practice — one commit = one responsibility:**
```bash
# ✅ Good: atomic commits
git commit -m "feat(auth): implement JWT middleware"
git commit -m "feat(auth): add JWT generation service"

# ❌ Avoid: everything in one commit
git commit -m "auth stuff"
```

**Security note — intentionally generic error message:**
```javascript
// auth-controller.js
// The message is IDENTICAL whether the email doesn't exist
// or the password is wrong — this is intentional:
// prevents account enumeration attacks
return res.status(401).json({ error: 'Invalid credentials' });
```

---

### Phase 3 — Bob implements user profiles (in parallel)

Bob branches off `main` — not off Alice's branch. Both work independently.

```bash
git switch main
git switch -c feature/PROJ-102-user-profile
```

Bob builds `GET /users/:id` and also modifies `src/routes.js`.  
**He has no idea Alice modified the same file** — a conflict is inevitable.

**Security note — never expose the password hash:**
```javascript
// user-controller.js
const { password_hash, ...safeUser } = user;
// password_hash is excluded, safeUser contains everything else
res.json(safeUser);
```

---

### Phase 4 — Pull Requests and code review

Alice opens PR #1 first. Bob reviews it and raises two points:

**Remark 1 — critical security issue:**
```
[SUGGESTION] JWT_SECRET should not be optional in production.
If the env variable is not set, tokens will be signed with
'dev-secret-change-in-prod' — a critical security flaw.
```

Alice fixes it:
```javascript
// auth-service.js — add the production check
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
}
```

**Remark 2 — code readability:**
```
[QUESTION] The "Invalid credentials" message is identical
in both error cases. Is that intentional?
```

Alice adds an explanatory comment to the code.

> **What we learn about code review:**  
> A good reviewer mixes suggestions, questions, and praise.  
> The goal isn't to criticize — it's to improve the code together.

Bob approves → Alice merges PR #1 into `main`.

---

### Phase 5 — Bob rebases and resolves the conflict ⚔️

`main` has moved forward (Alice's PR merged). Bob needs to update his branch.

```bash
git switch feature/PROJ-102-user-profile
git rebase main
```

Git stops:
```
CONFLICT (content): Merge conflict in src/routes.js
error: could not apply c8f3b2a... feat(users): register GET /users/:id route
```

**Reading conflict markers:**
```
<<<<<<< HEAD               ← start of main version (Alice's work)
const { login } = require('./api/auth-controller');
const { authenticate } = require('./middleware/auth');
=======                    ← separator
const { getUserById } = require('./api/user-controller');
>>>>>>> c8f3b2a            ← end of Bob's version
```

**Bob resolves by combining both versions:**
```javascript
// ✅ Final version — combines Alice + Bob + a deliberate technical decision
const { login } = require('./api/auth-controller');
const { authenticate } = require('./middleware/auth');
const { getUserById } = require('./api/user-controller');

router.post('/auth/login', login);
router.get('/users/:id', authenticate, getUserById); // ← authenticate added by Bob
router.get('/protected', authenticate, (req, res) => { ... });
```

> **Bob's technical decision:** he adds `authenticate` on `/users/:id`.  
> User profiles contain personal data — they shouldn't be public.  
> The rebase forced him to make this decision consciously.

```bash
git add src/routes.js
git rebase --continue
git push --force-with-lease origin feature/PROJ-102-user-profile
```

> **`--force-with-lease` vs `--force`:**  
> `--force` overwrites everything blindly.  
> `--force-with-lease` refuses if someone else pushed in the meantime — much safer on a shared branch.

**Rebase vs Merge — what's the difference?**

| | `merge` | `rebase` |
|---|---|---|
| History | Extra merge commit | Linear, no merge commit |
| Readability | Feature branches visible in graph | Clean, sequential history |
| Recommended for | Merging a PR into `main` | Updating a feature branch |

---

### Phase 6 — Bob's PR, Alice's review, final merge

Alice reviews Bob's PR and spots a potential improvement:

```
[SUGGESTION] Group protected routes under a dedicated router
to avoid forgetting the middleware on future routes:

const protectedRouter = express.Router();
protectedRouter.use(authenticate);
protectedRouter.get('/users/:id', getUserById);
router.use(protectedRouter);
```

Bob replies:
```
Great suggestion — ticket created: PROJ-115
Let's do this in a dedicated PR to keep this one focused.
```

> **Best practice: One PR = one feature.**  
> Expanding scope mid-review delays the merge and complicates rollbacks.

Alice approves → Bob merges PR #2.

---

### Final history

```
*   Merge pull request #2 (feature/PROJ-102-user-profile)
|\
| * test(users): add GET /users/:id tests
| * feat(users): register GET /users/:id route
| * feat(users): add GET /users/:id controller
*   Merge pull request #1 (feature/PROJ-101-user-authentication)
|\
| * fix(auth): require JWT_SECRET in production
| * test(auth): add authentication module tests
| * feat(auth): register auth routes
| * feat(auth): add POST /auth/login controller
| * feat(auth): add JWT generation service
| * feat(auth): implement JWT middleware
|/
* chore: initialize API project structure
```

---

## 💡 Best Practices Summary

### Git
- **Atomic commits**: one commit = one responsibility
- **Descriptive messages**: follow Conventional Commits
- **Rebase before merging**: keep a linear history
- **`--force-with-lease`**: never use `--force` alone on a shared branch
- **Short-lived branches**: merge fast, avoid divergence

### Code Review
- Mix suggestions, questions, and praise
- Explain the *why*, not just flag the *what*
- Respond to every comment, even just to say "noted"
- Create a ticket if a suggestion is out of scope for the current PR

### Security
- `JWT_SECRET` required in production
- Generic error messages to prevent account enumeration
- Never expose `password_hash` in API responses
- Routes with personal data always protected by authentication

---

## 🔗 Resources

- [Conventional Commits](https://www.conventionalcommits.org)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [nvm — Node Version Manager](https://github.com/nvm-sh/nvm)
- [JWT.io — Understanding JSON Web Tokens](https://jwt.io/introduction)

---

*Project built as part of Module 2 — Version Control with Git*