# Render.com Deployment Guide for ERP Backend

## 🚀 Step-by-Step Deployment to Render.com

### Step 1: Sign Up / Sign In

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started"** or **"Sign In"**
3. Choose **"Sign in with GitHub"**
4. Authorize Render to access your GitHub repositories

---

### Step 2: Create New Web Service

1. Once logged in, click **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories

---

### Step 3: Connect Your Repository

1. Find **"Ngstivo/ERP"** in the list
2. Click **"Connect"** next to it
3. If you don't see it, click **"Configure account"** to grant access

---

### Step 4: Configure Your Service

Fill in these settings:

**Basic Settings:**
- **Name**: `erp-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., "Oregon (US West)")
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm run start:prod
  ```

**Instance Type:**
- Select **"Free"** (this is important!)

---

### Step 5: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add these 4 variables:

**1. DATABASE_URL**
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Theevilgenius@197@db.suuluymvxtbknyguxkbf.supabase.co:5432/postgres`

**2. NODE_ENV**
- **Key**: `NODE_ENV`
- **Value**: `production`

**3. JWT_SECRET**
- **Key**: `JWT_SECRET`
- **Value**: `erp-super-secret-jwt-key-12345`

**4. FRONTEND_URL**
- **Key**: `FRONTEND_URL`
- **Value**: `http://localhost:3000`

**5. PORT** (Render requires this)
- **Key**: `PORT`
- **Value**: `3001`

---

### Step 6: Create Web Service

1. Review all settings
2. Click **"Create Web Service"** button at the bottom
3. Render will start deploying your backend!

---

### Step 7: Monitor Deployment

You'll see the deployment logs in real-time:
- **Building**: Installing dependencies and building your app
- **Deploying**: Starting your application
- **Live**: Your backend is running! ✅

This usually takes **3-5 minutes**.

---

### Step 8: Get Your Backend URL

Once deployment is complete:
1. You'll see **"Your service is live"** message
2. Copy your backend URL (looks like): 
   ```
   https://erp-backend-xxxx.onrender.com
   ```
3. Save this URL - you'll need it for the frontend!

---

### Step 9: Test Your Backend

Visit your backend URL + `/api/docs`:
```
https://erp-backend-xxxx.onrender.com/api/docs
```

You should see the **Swagger API Documentation**! 🎉

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Sleeps after 15 minutes** of inactivity
- **Wakes up in ~30 seconds** when accessed
- **750 hours/month** (enough for development)

### Auto-Deploy:
- Every time you push to GitHub `main` branch
- Render automatically redeploys your backend
- No manual redeployment needed!

---

## 🔧 Troubleshooting

### Build Fails:
- Check the logs in Render dashboard
- Verify `Root Directory` is set to `backend`
- Ensure all environment variables are set

### App Crashes:
- Check logs for errors
- Verify `DATABASE_URL` is correct
- Make sure `PORT` environment variable is set

### Can't Access API:
- Wait 30 seconds if app is sleeping
- Check if deployment is "Live" (green status)
- Verify URL includes `/api/docs`

---

## ✅ Next Steps After Deployment

1. ✅ Backend deployed on Render
2. ✅ Test API documentation
3. 🔜 Deploy frontend on Vercel
4. 🔜 Connect frontend to backend
5. 🔜 Create first user and test the app

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Your Dashboard**: https://dashboard.render.com

**Your backend will be live in about 5 minutes!** 🚀
