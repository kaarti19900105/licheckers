# DigitalOcean App Platform Deployment Guide

Complete step-by-step guide to deploy Licheckers to DigitalOcean.

## Prerequisites

- ✅ GitHub repository: `kaarti19900105/licheckers` (already set up)
- 💳 DigitalOcean account (sign up at https://www.digitalocean.com)
- 💰 Credit card for billing (you can prepay credits)

---

## Step 1: Create DigitalOcean Account

1. Go to https://www.digitalocean.com
2. Click **Sign Up**
3. Enter your email and create a password
4. Verify your email address
5. Complete account setup

---

## Step 2: Add Prepaid Credits (Recommended)

This gives you controlled billing:

1. Log in to DigitalOcean
2. Click your profile icon (top right) → **Billing**
3. Click **Make a payment** button
4. Enter amount:
   - **$50** = ~2 months (minimum setup)
   - **$100** = ~4 months (recommended setup)
   - **$200** = ~8 months (comfortable buffer)
5. Complete payment
6. **Set Spending Alerts**:
   - Go to **Settings** → **Billing** → **Alerts**
   - Add alerts at: $25, $50, $75, $100
   - Get email notifications when approaching limits

---

## Step 3: Create New App

1. In DigitalOcean dashboard, click **Apps** in left sidebar
2. Click **Create App** button (top right)
3. You'll see "Create App from Source" page

---

## Step 4: Connect GitHub Repository

1. Click **GitHub** tab
2. If not connected, click **Connect GitHub**
3. Authorize DigitalOcean to access your repositories
4. Search for: `kaarti19900105/licheckers`
5. Select the repository
6. Select branch: **main**
7. Click **Next**

---

## Step 5: Configure App Structure

DigitalOcean will try to auto-detect. We'll configure manually:

### Option A: Use App Spec File (Recommended)

1. DigitalOcean should detect `.do/app.yaml` file
2. If it shows "App Spec detected", click **Review detected app spec**
3. Review the configuration
4. Click **Next**

### Option B: Manual Configuration

If auto-detection doesn't work, configure manually:

#### Add Frontend Service

1. Click **Edit Plan** or **Skip** auto-detection
2. Click **Add Service** → **Web Service**
3. Configure:
   - **Name**: `licheckers-client`
   - **Source Directory**: `/` (root)
   - **Build Command**: `npm install && cd client && npm run build`
   - **Run Command**: `cd client && npm run preview -- --host 0.0.0.0 --port 4173`
   - **HTTP Port**: `4173`
   - **Instance Size**: 
     - **Basic ($5/month)** for MVP
     - **Professional ($12/month)** for production
   - **Instance Count**: `1`

4. Add Environment Variables:
   - Click **Add Variable**
   - `NODE_ENV` = `production`
   - `VITE_API_URL` = (leave empty, will auto-populate from backend)

#### Add Backend Service

1. Click **Add Service** → **Web Service**
2. Configure:
   - **Name**: `licheckers-server`
   - **Source Directory**: `/` (root)
   - **Build Command**: `npm install && cd server && npm run build`
   - **Run Command**: `cd server && npm start`
   - **HTTP Port**: `3001`
   - **Instance Size**: Same as frontend
   - **Instance Count**: `1`

3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `DATABASE_URL` = (leave empty, will auto-populate from database)
   - `CORS_ORIGIN` = (leave empty, will auto-populate from frontend)

#### Add Database

1. Click **Add Resource** → **Database**
2. Configure:
   - **Database Engine**: PostgreSQL
   - **Version**: `15` (latest stable)
   - **Plan**: 
     - **Basic ($15/month)** for MVP
     - **Professional ($25/month)** for production
   - **Database Name**: `licheckers`
   - **Database User**: `licheckers`
   - **Region**: Same as app (e.g., `nyc1`)

---

## Step 6: Review Configuration

1. Review all services:
   - ✅ Frontend service configured
   - ✅ Backend service configured
   - ✅ Database configured

2. Check **Estimated Monthly Cost** (shown at bottom):
   - Minimum: ~$25/month
   - Recommended: ~$49/month

3. Review environment variables are set correctly

4. Click **Create Resources**

---

## Step 7: Wait for Deployment

1. You'll see build logs in real-time
2. Watch for:
   - ✅ Frontend building
   - ✅ Backend building
   - ✅ Database provisioning
   - ✅ Services starting

3. **First deployment takes 5-10 minutes**

4. You'll see green checkmarks when each service is ready

---

## Step 8: Get Your URLs

After deployment completes:

1. Go to your App dashboard
2. You'll see:
   - **Frontend URL**: `https://licheckers-client-xxxxx.ondigitalocean.app`
   - **Backend URL**: `https://licheckers-server-xxxxx.ondigitalocean.app`
   - **Database**: Internal connection only

3. **Copy these URLs** - you'll need them

---

## Step 9: Update Environment Variables

After first deployment, update cross-service references:

1. Go to **Settings** → **App-Level Environment Variables**

2. Update Frontend:
   - Find `VITE_API_URL`
   - Set to: `https://licheckers-server-xxxxx.ondigitalocean.app`
   - (Replace with your actual backend URL)

3. Update Backend:
   - Find `CORS_ORIGIN`
   - Set to: `https://licheckers-client-xxxxx.ondigitalocean.app`
   - (Replace with your actual frontend URL)

4. Click **Save**

5. **Redeploy** (DigitalOcean will auto-redeploy when you save env vars)

---

## Step 10: Test Your Deployment

1. Visit your frontend URL in browser
2. You should see the Licheckers home page
3. Try:
   - ✅ Play vs Computer
   - ✅ Select difficulty
   - ✅ Start a game
   - ✅ Make moves
   - ✅ Check browser console for errors

---

## Step 11: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `licheckers.org`)
4. DigitalOcean will show DNS records to add:
   - Add CNAME record pointing to DigitalOcean
5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate is automatically provisioned

---

## Monitoring & Management

### View Logs

1. Go to your App → **Runtime Logs**
2. View real-time logs from all services
3. Filter by service: `licheckers-client` or `licheckers-server`

### Set Spending Alerts

1. Go to **Settings** → **Billing** → **Alerts**
2. Add alerts:
   - Alert at $25
   - Alert at $50
   - Alert at $75
   - Alert at $100
3. Get email notifications

### Scale Resources

1. Go to your service → **Settings** → **Components**
2. Adjust:
   - **Instance Size**: Upgrade if needed
   - **Instance Count**: Scale horizontally
3. Changes take effect immediately

### Add More Credits

1. Go to **Billing** → **Make a payment**
2. Add credits anytime
3. Credits are used before charging your card

---

## Troubleshooting

### Build Fails

**Problem**: Build command fails

**Solution**:
1. Check build logs in **Runtime Logs**
2. Common issues:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Fix in code
   - Build command wrong → Update in app.yaml

### Database Connection Issues

**Problem**: Backend can't connect to database

**Solution**:
1. Check `DATABASE_URL` environment variable
2. Verify database is running (should show green in dashboard)
3. Check database firewall rules
4. Ensure backend service can access database (same app)

### WebSocket Not Working

**Problem**: Socket.io connections fail

**Solution**:
1. Check backend URL is correct in frontend
2. Verify CORS settings in backend
3. Check WebSocket route is configured (`/socket.io`)
4. Test with browser DevTools → Network tab

### Frontend Can't Reach Backend

**Problem**: API calls fail

**Solution**:
1. Check `VITE_API_URL` is set correctly
2. Verify backend is running (check logs)
3. Check CORS origin matches frontend URL
4. Test backend health endpoint: `https://your-backend-url/api/health`

---

## Cost Breakdown

### Minimum Setup (MVP)
- Frontend: $5/month (Basic)
- Backend: $5/month (Basic)
- Database: $15/month (Basic)
- **Total: ~$25/month**

### Recommended Setup (Production)
- Frontend: $12/month (Professional)
- Backend: $12/month (Professional)
- Database: $25/month (Professional)
- **Total: ~$49/month**

### With Prepaid Credits
- Prepay $100 = ~2-4 months depending on setup
- Credits used first, then card charged
- Set alerts to monitor spending

---

## Next Steps

1. ✅ Deploy to DigitalOcean
2. ✅ Test all features
3. ✅ Set up custom domain (optional)
4. ✅ Monitor usage and costs
5. ✅ Add more credits as needed

---

## Support Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **Community**: https://www.digitalocean.com/community
- **Support**: Available in dashboard

---

## Quick Reference

**App Spec File**: `.do/app.yaml`  
**Frontend Build**: `npm install && cd client && npm run build`  
**Backend Build**: `npm install && cd server && npm run build`  
**Frontend Port**: `4173`  
**Backend Port**: `3001`  

Good luck with your deployment! 🚀

