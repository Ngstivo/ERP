# Railway Deployment Guide for ERP Backend

## Quick Deploy to Railway (Recommended)

Railway provides the easiest deployment with automatic PostgreSQL provisioning.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser for authentication.

### Step 3: Initialize Project

```bash
cd c:\Users\NIS\.gemini\antigravity\scratch\ERP
railway init
```

Select:
- **Create new project** → Yes
- **Project name** → ERP-Backend (or your preferred name)

### Step 4: Add PostgreSQL Database

```bash
railway add
```

Select: **PostgreSQL**

Railway will automatically provision a PostgreSQL database and set environment variables.

### Step 5: Set Environment Variables

```bash
# Set JWT secret
railway variables set JWT_SECRET=$(openssl rand -hex 32)

# Set Node environment
railway variables set NODE_ENV=production

# Set frontend URL (update after Vercel deployment)
railway variables set FRONTEND_URL=https://your-vercel-app.vercel.app

# Port (Railway sets this automatically, but you can verify)
railway variables set PORT=3001
```

**Note**: Railway automatically sets these database variables:
- `DATABASE_URL` (full connection string)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Step 6: Update Backend for Railway

The backend needs to read Railway's database variables. Update `backend/src/app.module.ts` to use `DATABASE_URL` if available:

```typescript
// In TypeOrmModule.forRootAsync
useFactory: (configService: ConfigService) => {
  const databaseUrl = configService.get('DATABASE_URL');
  
  if (databaseUrl) {
    // Railway provides DATABASE_URL
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: configService.get('NODE_ENV') === 'development',
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
  
  // Fallback to individual variables
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
  };
}
```

### Step 7: Deploy Backend

```bash
# Deploy from backend directory
cd backend
railway up
```

Or deploy from root:
```bash
railway up --service backend
```

### Step 8: Run Database Migrations

```bash
railway run npm run migration:run
```

### Step 9: Get Your Backend URL

```bash
railway domain
```

This will show your backend URL (e.g., `https://erp-backend-production.up.railway.app`)

### Step 10: Update Frontend Environment Variable

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Update `VITE_API_URL` to: `https://your-railway-url.up.railway.app/api`
3. Redeploy frontend

## Alternative: Deploy via Railway Dashboard (No CLI)

### Option 1: Deploy from GitHub

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `Ngstivo/ERP` repository
5. Railway will detect the NestJS app

### Option 2: Configure Build Settings

In Railway Dashboard:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### Option 3: Add PostgreSQL

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically links it to your backend

### Option 4: Set Environment Variables

In Railway Dashboard → Variables:
```
NODE_ENV=production
JWT_SECRET=<generate-random-string>
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=3001
```

## Verify Deployment

### Check Backend Health

Visit: `https://your-railway-url.up.railway.app/api/docs`

You should see the Swagger API documentation.

### Check Database Connection

Railway dashboard will show:
- ✅ Service running
- ✅ Database connected
- ✅ Build logs

## Costs

- **Free Tier**: $5 credit/month (enough for development)
- **Hobby Plan**: $5/month (500 hours execution)
- **Pro Plan**: $20/month (unlimited)

## Troubleshooting

### Build Fails

Check Railway logs:
```bash
railway logs
```

### Database Connection Issues

Verify environment variables:
```bash
railway variables
```

### Port Issues

Railway automatically assigns a PORT. Make sure your `main.ts` uses:
```typescript
const port = process.env.PORT || 3001;
```

## Complete Architecture After Deployment

```
┌─────────────────────────────────┐
│   Vercel (Frontend)             │
│   your-app.vercel.app           │
└────────────┬────────────────────┘
             │
             │ HTTPS API calls
             ↓
┌─────────────────────────────────┐
│   Railway (Backend)             │
│   erp-backend.up.railway.app    │
└────────────┬────────────────────┘
             │
             │ PostgreSQL connection
             ↓
┌─────────────────────────────────┐
│   Railway PostgreSQL            │
│   (Managed Database)            │
└─────────────────────────────────┘
```

## Next Steps After Deployment

1. ✅ Backend deployed on Railway
2. ✅ Database provisioned and connected
3. ✅ Update Vercel frontend with Railway backend URL
4. ✅ Test the complete application
5. ✅ Set up custom domain (optional)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your Railway Dashboard: https://railway.app/dashboard

**Your backend will be live in ~2-3 minutes after deployment!** 🚀
