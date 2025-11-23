# 🚀 Beginner's Guide: Deploy ERP System with Supabase + Vercel

## What We're Building

```
Frontend (Vercel) → Backend (Vercel) → Database (Supabase)
```

This guide will take you from zero to a fully deployed ERP system in about 30 minutes!

---

## Part 1: Setup Supabase Database (10 minutes)

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Click **"Sign in with GitHub"**
4. Authorize Supabase to access your GitHub

### Step 2: Create New Project

1. Click **"New Project"** (green button)
2. Fill in the form:
   - **Name**: `erp-production`
   - **Database Password**: Click "Generate a password" and **SAVE IT SOMEWHERE SAFE!**
   - **Region**: Choose closest to you (e.g., "East US" if you're in USA)
   - **Pricing Plan**: Select "Free"
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete ☕

### Step 3: Get Database Connection String

1. In your Supabase project, click **"Settings"** (gear icon in sidebar)
2. Click **"Database"** in the left menu
3. Scroll down to **"Connection string"**
4. Click **"URI"** tab
5. Copy the connection string (looks like this):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you saved earlier
7. Save this complete connection string - you'll need it!

---

## Part 2: Deploy Backend to Vercel (10 minutes)

### Step 4: Install Vercel CLI

Open your terminal/command prompt:

```bash
npm install -g vercel
```

### Step 5: Login to Vercel

```bash
vercel login
```

This will open your browser. Sign in with GitHub.

### Step 6: Navigate to Backend Folder

```bash
cd c:\Users\NIS\.gemini\antigravity\scratch\ERP\backend
```

### Step 7: Create Vercel Configuration

Create a file called `vercel.json` in the backend folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
```

**How to create this file:**
1. Open VS Code
2. Navigate to `backend` folder
3. Right-click → New File → `vercel.json`
4. Paste the content above
5. Save (Ctrl+S)

### Step 8: Deploy Backend

```bash
vercel --prod
```

**You'll be asked some questions:**

1. **"Set up and deploy"?** → Press **Enter** (Yes)
2. **"Which scope"?** → Press **Enter** (your account)
3. **"Link to existing project"?** → Type `n` and press **Enter** (No)
4. **"What's your project's name"?** → Type `erp-backend` and press **Enter**
5. **"In which directory is your code located"?** → Press **Enter** (current directory)
6. **"Want to override settings"?** → Type `n` and press **Enter** (No)

Wait for deployment... ⏳

### Step 9: Set Environment Variables in Vercel

After deployment completes:

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **"erp-backend"** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left menu
5. Add these variables one by one:

**Variable 1:**
- **Name**: `DATABASE_URL`
- **Value**: Paste your Supabase connection string from Step 3
- Click **"Add"**

**Variable 2:**
- **Name**: `NODE_ENV`
- **Value**: `production`
- Click **"Add"**

**Variable 3:**
- **Name**: `JWT_SECRET`
- **Value**: `your-super-secret-key-change-this-in-production`
- Click **"Add"**

**Variable 4:**
- **Name**: `PORT`
- **Value**: `3001`
- Click **"Add"**

6. Click **"Deployments"** tab
7. Click the **"..."** menu on the latest deployment
8. Click **"Redeploy"**
9. Check **"Use existing Build Cache"**
10. Click **"Redeploy"**

### Step 10: Get Your Backend URL

After redeployment completes:

1. Click on the deployment
2. Click **"Visit"** button
3. Copy the URL (e.g., `https://erp-backend-xxx.vercel.app`)
4. **Save this URL** - you'll need it for the frontend!

### Step 11: Test Your Backend

Visit: `https://your-backend-url.vercel.app/api/docs`

You should see the Swagger API documentation! 🎉

---

## Part 3: Deploy Frontend to Vercel (10 minutes)

### Step 12: Navigate to Frontend Folder

```bash
cd c:\Users\NIS\.gemini\antigravity\scratch\ERP\frontend
```

### Step 13: Update Environment Variable

1. Open `frontend/.env.example`
2. Create a new file called `.env.production`
3. Add this line (replace with YOUR backend URL from Step 10):
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
4. Save the file

### Step 14: Deploy Frontend

```bash
vercel --prod
```

**You'll be asked:**

1. **"Set up and deploy"?** → Press **Enter** (Yes)
2. **"Which scope"?** → Press **Enter**
3. **"Link to existing project"?** → Type `n` and press **Enter**
4. **"What's your project's name"?** → Type `erp-frontend` and press **Enter**
5. **"In which directory"?** → Press **Enter**
6. **"Want to override settings"?** → Type `y` and press **Enter** (Yes)
7. **"Build Command"?** → Type `npm run build` and press **Enter**
8. **"Output Directory"?** → Type `dist` and press **Enter**
9. **"Development Command"?** → Press **Enter** (skip)

Wait for deployment... ⏳

### Step 15: Set Frontend Environment Variable

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **"erp-frontend"** project
3. Click **"Settings"** → **"Environment Variables"**
4. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api` (from Step 10)
   - Click **"Add"**
5. Go to **"Deployments"** tab
6. Redeploy (same as Step 9)

### Step 16: Get Your Frontend URL

After redeployment:

1. Click on the deployment
2. Click **"Visit"**
3. Your ERP system should load! 🎉

---

## Part 4: Setup Database Tables (5 minutes)

### Step 17: Run Database Migrations

Back in your terminal:

```bash
cd c:\Users\NIS\.gemini\antigravity\scratch\ERP\backend

# Install dependencies if not already installed
npm install

# Run migrations to create all tables
npm run migration:run
```

This creates all 25+ tables in your Supabase database!

### Step 18: Verify Database

1. Go to your Supabase project
2. Click **"Table Editor"** in the sidebar
3. You should see all your tables: users, products, warehouses, etc.

---

## 🎉 You're Done! Test Your Application

### Test the Complete System:

1. **Visit your frontend URL**: `https://erp-frontend-xxx.vercel.app`
2. **Try to login** (you'll need to create a user first)
3. **Check API docs**: `https://erp-backend-xxx.vercel.app/api/docs`

### Create First User (via Supabase):

1. Go to Supabase → **Table Editor**
2. Click **"users"** table
3. Click **"Insert"** → **"Insert row"**
4. Fill in:
   - **email**: your email
   - **password**: (will be hashed by backend)
   - **firstName**: Your name
   - **isActive**: `true`
5. Click **"Save"**

Or use the API docs to register via `/api/auth/register`

---

## 📝 Summary - Your Deployed URLs

Save these URLs:

- **Frontend**: `https://erp-frontend-xxx.vercel.app`
- **Backend API**: `https://erp-backend-xxx.vercel.app/api`
- **API Docs**: `https://erp-backend-xxx.vercel.app/api/docs`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/your-project-id`

---

## 🔧 Troubleshooting

### Backend shows "Internal Server Error"
- Check Vercel logs: Dashboard → erp-backend → Deployments → Click deployment → "Logs"
- Make sure `DATABASE_URL` is set correctly
- Make sure you ran migrations (`npm run migration:run`)

### Frontend shows "Network Error"
- Check `VITE_API_URL` is set correctly in Vercel
- Make sure backend URL ends with `/api`
- Check browser console for errors (F12)

### Database connection fails
- Verify Supabase connection string is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Check Supabase project is running (green status)

### Can't login
- Make sure you created a user in the database
- Check backend logs for authentication errors
- Verify JWT_SECRET is set

---

## 🎯 Next Steps

1. ✅ Create your first user
2. ✅ Add some products
3. ✅ Create warehouses
4. ✅ Start managing inventory!

### Optional Improvements:

- **Custom Domain**: Add your own domain in Vercel settings
- **Email Setup**: Configure SMTP for email notifications
- **Backups**: Supabase auto-backs up your database
- **Monitoring**: Check Vercel Analytics and Supabase logs

---

## 💰 Costs

**Current Setup (FREE!):**
- ✅ Vercel Free Tier: Unlimited deployments
- ✅ Supabase Free Tier: 500MB database
- ✅ Total Cost: **$0/month**

**When to Upgrade:**
- Vercel Pro ($20/month): More bandwidth, better performance
- Supabase Pro ($25/month): 8GB database, daily backups

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Your API Docs**: https://your-backend.vercel.app/api/docs

**Congratulations! Your ERP system is now live! 🚀**
