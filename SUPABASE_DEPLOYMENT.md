# Supabase Deployment Guide for ERP System

## Overview

Supabase provides:
- ✅ **PostgreSQL Database** (managed, with automatic backups)
- ✅ **Authentication** (can replace your JWT auth or work alongside it)
- ✅ **Edge Functions** (for serverless backend deployment)
- ✅ **Storage** (for file uploads)
- ✅ **Real-time subscriptions** (bonus feature)

## Architecture Options

### Option 1: Supabase Database + External Backend (Recommended)
- **Database**: Supabase PostgreSQL
- **Backend**: Deploy NestJS on Vercel/Railway/Render
- **Frontend**: Vercel

**Pros**: Full NestJS features, easier migration, all existing code works
**Cons**: Need separate backend hosting

### Option 2: Full Supabase (Database + Edge Functions)
- **Database**: Supabase PostgreSQL
- **Backend**: Supabase Edge Functions (requires refactoring)
- **Frontend**: Vercel

**Pros**: All-in-one platform, simpler infrastructure
**Cons**: Need to refactor NestJS to Edge Functions (Deno runtime)

---

## 🚀 Quick Start: Option 1 (Recommended)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name**: ERP-Production
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### Step 2: Get Database Connection Details

In Supabase Dashboard:
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Copy the **URI** (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Step 3: Update Backend Environment Variables

**For Local Development** (`backend/.env`):
```env
# Supabase Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# Or use individual variables
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_DATABASE=postgres

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**For Production** (Railway/Vercel/Render):
Set these environment variables in your hosting platform:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 4: Run Database Migrations

```bash
cd backend

# Install dependencies
npm install

# Run migrations to create tables
npm run migration:run

# Optional: Seed initial data
npm run seed
```

### Step 5: Deploy Backend

**Option A: Vercel (Serverless)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

**Option B: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd backend
railway login
railway init
railway up
```

**Option C: Render.com**
1. Connect GitHub repository
2. Create new Web Service
3. Root directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm run start:prod`

### Step 6: Configure Supabase Connection Pooling (Important!)

For production, enable connection pooling:

1. In Supabase Dashboard → **Settings** → **Database**
2. Find **Connection Pooling** section
3. Use the **Transaction** mode connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

Update your `DATABASE_URL` to use this pooled connection.

### Step 7: Update Frontend

In Vercel Dashboard → Environment Variables:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

---

## 🔧 Option 2: Supabase Edge Functions (Advanced)

If you want to use Supabase Edge Functions instead of NestJS:

### Considerations:
- Edge Functions use **Deno** (not Node.js)
- Need to refactor NestJS code to Edge Functions
- Each API endpoint becomes a separate function
- 10-second execution limit
- Good for: Simple CRUD operations
- Not ideal for: Complex business logic, long-running tasks

### Migration Steps:

1. **Create Edge Function**:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Create function
supabase functions new products
```

2. **Example Edge Function** (`supabase/functions/products/index.ts`):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Method not allowed', { status: 405 })
})
```

3. **Deploy Function**:
```bash
supabase functions deploy products
```

**Note**: This requires significant refactoring of your existing NestJS code.

---

## 📊 Database Schema Setup

### Option A: Use TypeORM Migrations (Recommended)

Your existing migrations will work with Supabase:

```bash
cd backend
npm run migration:run
```

### Option B: Use Supabase SQL Editor

1. Go to Supabase Dashboard → **SQL Editor**
2. Create tables manually or paste migration SQL
3. Run queries

### Option C: Use Supabase Table Editor (GUI)

1. Go to **Table Editor**
2. Create tables using the visual interface
3. Good for quick prototyping

---

## 🔐 Authentication Options

### Option 1: Keep Your JWT Auth (Current Setup)
- No changes needed
- Your NestJS auth module handles everything
- Supabase just provides the database

### Option 2: Use Supabase Auth
- Replace your auth module with Supabase Auth
- Benefits: Built-in OAuth, magic links, email verification
- Requires refactoring auth logic

**To use Supabase Auth:**

1. **Frontend** (`frontend/src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)
```

2. **Login**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 500MB database space
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ 2 million Edge Function invocations

### Pro Tier ($25/month):
- ✅ 8GB database space
- ✅ 100GB file storage
- ✅ 250GB bandwidth
- ✅ No user limits
- ✅ Daily backups
- ✅ Priority support

---

## 🎯 Recommended Setup for Your ERP

```
┌─────────────────────────────────┐
│   Vercel (Frontend)             │
│   React + Material-UI           │
└────────────┬────────────────────┘
             │
             │ HTTPS API calls
             ↓
┌─────────────────────────────────┐
│   Railway/Vercel (Backend)      │
│   NestJS API                    │
└────────────┬────────────────────┘
             │
             │ PostgreSQL connection
             ↓
┌─────────────────────────────────┐
│   Supabase PostgreSQL           │
│   (Managed Database)            │
└─────────────────────────────────┘
```

**Why this setup?**
- ✅ Use Supabase's excellent managed PostgreSQL
- ✅ Keep all your NestJS code as-is
- ✅ Easy to scale
- ✅ Automatic database backups
- ✅ Built-in connection pooling
- ✅ Database monitoring and analytics

---

## 🚀 Quick Deploy Commands

```bash
# 1. Create Supabase project (via dashboard)

# 2. Update backend .env with Supabase connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# 3. Run migrations
cd backend
npm run migration:run

# 4. Deploy backend to Railway
railway login
railway init
railway variables set DATABASE_URL="your-supabase-url"
railway up

# 5. Deploy frontend to Vercel
cd frontend
vercel --prod

# 6. Update Vercel env variable
# VITE_API_URL=https://your-railway-backend.railway.app/api
```

---

## 📝 Environment Variables Checklist

### Backend (Railway/Vercel):
```
✅ DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
✅ NODE_ENV=production
✅ JWT_SECRET=your-secret
✅ FRONTEND_URL=https://your-app.vercel.app
✅ PORT=3001
```

### Frontend (Vercel):
```
✅ VITE_API_URL=https://your-backend.railway.app/api
```

---

## 🔍 Monitoring & Debugging

### Supabase Dashboard:
- **Database** → View tables, run queries
- **Table Editor** → Edit data visually
- **SQL Editor** → Run custom SQL
- **Logs** → View database logs
- **Reports** → Database performance metrics

### Check Connection:
```bash
# Test database connection
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

---

## ✅ Next Steps

1. ✅ Create Supabase project
2. ✅ Get database connection string
3. ✅ Update backend environment variables
4. ✅ Run migrations
5. ✅ Deploy backend (Railway/Vercel/Render)
6. ✅ Deploy frontend (Vercel)
7. ✅ Test complete application

**Your ERP system will be production-ready with Supabase's managed PostgreSQL!** 🎉

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + NestJS Guide](https://supabase.com/docs/guides/integrations/nestjs)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
