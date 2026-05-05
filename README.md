# Market MVP Server

Backend for a mobile marketplace MVP.

Node.js / Express / Prisma / Supabase (PostgreSQL) / JWT

---

## Features

* signup / login (JWT)
* create product (auth)
* list products
* toggle favorite
* upload image (multer → Supabase Storage → imageUrl)

---

## .env example

Create a `.env` file:

```env
# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# Supabase
# Server
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=
```

---

## Run

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
