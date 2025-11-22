# Vercel Deployment Guide

## Important: This is a Full-Stack Application

This ERP system consists of:
- **Frontend**: React application (can be deployed on Vercel)
- **Backend**: NestJS API (requires Node.js server - cannot run on Vercel's free tier)

## Frontend Deployment on Vercel

### Option 1: Deploy Frontend Only (Recommended for Testing)

1. **Update Frontend Environment Variable**
   
   In Vercel dashboard, add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Deploy**
   ```bash
   # From project root
   vercel --prod
   ```

3. **Configure Build Settings in Vercel Dashboard:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option 2: Use Vercel Serverless Functions (Limited)

Vercel serverless functions have limitations:
- 10-second execution timeout on Hobby plan
- 50MB deployment size limit
- Not suitable for database connections and complex backend logic

**This backend is too complex for Vercel serverless functions.**

## Backend Deployment Options

### Recommended: Deploy Backend Separately

**Option 1: Railway.app (Easiest)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option 2: Render.com**
1. Connect your GitHub repository
2. Create a new Web Service
3. Set root directory to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm run start:prod`
6. Add environment variables

**Option 3: Heroku**
```bash
# Install Heroku CLI
heroku create your-erp-backend
git subtree push --prefix backend heroku main
```

**Option 4: DigitalOcean App Platform**
1. Connect GitHub repository
2. Select `backend` folder
3. Configure build and run commands
4. Add PostgreSQL database

**Option 5: AWS/Azure/GCP**
- Use Elastic Beanstalk (AWS)
- Use App Service (Azure)
- Use Cloud Run (GCP)

## Complete Deployment Architecture

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │ ← Users access here
└────────┬────────┘
         │ API calls
         ↓
┌─────────────────┐
│  Railway/Render │
│   (Backend)     │ ← Deploy NestJS here
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │ ← Database
│   (Managed DB)  │
└─────────────────┘
```

## Quick Fix for Current Vercel Deployment

If you want to deploy just the frontend to Vercel right now:

1. **Update `vercel.json` in root** (already created)

2. **Set Environment Variable in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `http://localhost:3001/api` (for testing)
   - Later update to your actual backend URL

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Alternative: Deploy Everything with Docker

If you want to deploy the complete stack together:

**Use these platforms:**
- **DigitalOcean**: Deploy using Docker Compose ($5-10/month)
- **AWS ECS**: Container service
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Container hosting

## Recommended Quick Solution

1. **Frontend on Vercel** (Free)
2. **Backend on Railway** (Free tier available, $5/month for production)
3. **Database on Railway** (Included with backend)

This gives you a complete working deployment for free/cheap!

## Need Help?

The backend requires:
- PostgreSQL database
- Node.js runtime
- Persistent storage
- Long-running processes

Vercel is optimized for static sites and serverless functions, not full backend applications.

**Choose Railway or Render for the easiest backend deployment experience!**
