# DigitalOcean App Platform Deployment Guide

This guide will walk you through deploying Licheckers to DigitalOcean App Platform.

## Prerequisites

1. A DigitalOcean account (sign up at https://www.digitalocean.com)
2. Your GitHub repository connected (already done: kaarti19900105/licheckers)
3. A credit card for billing (you can prepay credits)

## Step-by-Step Deployment

### Step 1: Sign Up / Log In to DigitalOcean

1. Go to https://cloud.digitalocean.com
2. Sign up or log in to your account
3. Complete account verification if needed

### Step 2: Add Prepaid Credits (Optional but Recommended)

1. Click on your profile → **Billing**
2. Click **Make a payment**
3. Enter amount (e.g., $50-100 for several months)
4. Complete payment
5. Set up **Spending Alerts** (Settings → Billing → Alerts)

### Step 3: Create New App

1. Go to **Apps** in the left sidebar
2. Click **Create App**
3. Select **GitHub** as source
4. Authorize DigitalOcean to access your GitHub if needed
5. Select repository: **kaarti19900105/licheckers**
6. Select branch: **main**
7. Click **Next**

### Step 4: Configure App

DigitalOcean will auto-detect your app structure. We'll configure it manually:

1. Click **Edit Plan** or **Skip** auto-detection
2. You'll configure services manually in the next step

### Step 5: Add Services

#### Add Frontend Service (Client)

1. Click **Add Service** → **Web Service**
2. Configure:
   - **Name**: `licheckers-client`
   - **Source Directory**: `/client`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Run Command**: `cd client && npm run preview`
   - **HTTP Port**: `4173`
   - **Instance Size**: Basic ($5/month) or Professional ($12/month)
   - **Instance Count**: 1

3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `VITE_API_URL` = (will be set automatically from backend URL)

#### Add Backend Service (Server)

1. Click **Add Service** → **Web Service**
2. Configure:
   - **Name**: `licheckers-server`
   - **Source Directory**: `/server`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Run Command**: `cd server && npm start`
   - **HTTP Port**: `3001`
   - **Instance Size**: Basic ($5/month) or Professional ($12/month)
   - **Instance Count**: 1

3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `DATABASE_URL` = (will be set automatically from database)
   - `CORS_ORIGIN` = (will be set automatically from frontend URL)

#### Add Database

1. Click **Add Resource** → **Database**
2. Configure:
   - **Database Engine**: PostgreSQL
   - **Version**: 15 (latest)
   - **Plan**: Basic ($15/month) or Professional ($25/month)
   - **Database Name**: `licheckers`
   - **Database User**: `licheckers`

### Step 6: Review and Deploy

1. Review your configuration
2. Check estimated monthly cost (shown at bottom)
3. Click **Create Resources**
4. DigitalOcean will start building and deploying

### Step 7: Wait for Deployment

1. Watch the build logs in real-time
2. Frontend and backend will build in parallel
3. Database will be provisioned
4. Usually takes 5-10 minutes

### Step 8: Configure Environment Variables

After first deployment, you may need to update environment variables:

1. Go to your App → **Settings** → **App-Level Environment Variables**
2. Update `VITE_API_URL` to point to your backend URL
3. Update `CORS_ORIGIN` to point to your frontend URL

### Step 9: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Post-Deployment

### Update Frontend to Use Backend URL

The frontend needs to know the backend URL. Update `client/vite.config.ts` or set environment variable:

```bash
VITE_API_URL=https://your-backend-url.ondigitalocean.app
```

### Test Your Deployment

1. Visit your frontend URL
2. Test playing a game vs computer
3. Check browser console for any errors
4. Test WebSocket connection (for future multiplayer)

## Monitoring & Management

### View Logs

1. Go to your App → **Runtime Logs**
2. View real-time logs from all services
3. Filter by service (client/server)

### Set Spending Alerts

1. Go to **Settings** → **Billing** → **Alerts**
2. Set alerts at $25, $50, $75, etc.
3. Get email notifications when approaching limits

### Scale Resources

1. Go to your service → **Settings** → **Components**
2. Adjust instance size or count
3. Changes take effect immediately

## Troubleshooting

### Build Fails

- Check build logs for errors
- Ensure all dependencies are in package.json
- Verify build commands are correct

### Database Connection Issues

- Check `DATABASE_URL` environment variable
- Verify database is running
- Check firewall rules

### WebSocket Not Working

- Ensure backend service has `/socket.io` route
- Check CORS settings
- Verify frontend is using correct backend URL

## Cost Breakdown

**Minimum Setup:**
- Frontend: $5/month (Basic)
- Backend: $5/month (Basic)
- Database: $15/month (Basic)
- **Total: ~$25/month**

**Recommended Setup:**
- Frontend: $12/month (Professional)
- Backend: $12/month (Professional)
- Database: $25/month (Professional)
- **Total: ~$49/month**

## Support

- DigitalOcean Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community

# Build fix
