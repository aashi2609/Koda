# Koda — Peer-to-Peer Skill Exchange

A platform where users swap skills: "I teach you X, you teach me Y."

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Auth**: Auth.js (NextAuth) — GitHub & Google OAuth
- **Database**: MongoDB via Mongoose
- **UI**: Tailwind CSS + Framer Motion — Cyber-Noir aesthetic
- **Testing**: Vitest + fast-check (property-based)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd koda
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_URL` | App URL — `http://localhost:3000` in dev |
| `NEXTAUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## OAuth Setup

### GitHub

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Secret into `.env.local`

### Google

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs and Services > Credentials > Create OAuth client ID > Web application
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret into `.env.local`

---

## MongoDB Setup

**Atlas (recommended):** Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), whitelist your IP, copy the connection string.

**Local:** `mongod --dbpath /data/db` then use `mongodb://localhost:27017/koda`.

---

## Running Tests

```bash
npm run test
```

Tests cover bio/message character limits (property-based), user filtering (property-based), skills validation, swap status schema, and auth middleware.

---

## Project Structure

```
app/
  page.tsx                  Login page
  onboarding/page.tsx       Profile setup
  discover/page.tsx         User discovery feed
  dashboard/page.tsx        Swap request management
  components/               Shared UI components
  api/
    auth/[...nextauth]/     Auth.js routes
    profile/                Profile CRUD
    users/                  User discovery
    swaps/                  Swap request CRUD
    swaps/[id]/             Swap status update
lib/
  dbConnect.ts              MongoDB singleton
  auth.ts                   Auth.js config
  apiAuth.ts                Auth middleware
  validations.ts            Zod schemas
models/
  User.ts                   User schema
  SwapRequest.ts            SwapRequest schema
```
