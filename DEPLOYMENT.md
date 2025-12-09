# Deployment Guide - FIFA 2026 World Cup Simulator

## Best Deployment Option: Vercel ⭐

**Why Vercel is recommended:**
- Built by Next.js creators - perfect optimization for Next.js apps
- Zero configuration needed - auto-detects Next.js
- Free tier: Unlimited personal projects
- Automatic deployments from GitHub on every push
- Global CDN included for fast performance
- Free custom domain support
- Automatic HTTPS/SSL certificates
- Preview deployments for pull requests
- Analytics included

**Free Tier Limits:**
- 100GB bandwidth/month (more than enough for this app)
- Unlimited requests
- Perfect for personal projects

## Quick Deployment Steps (Vercel Web Interface)

### Step 1: Sign Up / Sign In
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### Step 2: Import Project
1. After signing in, click **"Add New Project"** button
2. You'll see a list of your GitHub repositories
3. Find and select **`fifaSimulation`** repository
4. Click **"Import"**

### Step 3: Configure Project
**Important Configuration:**
- **Framework Preset**: Vercel will auto-detect "Next.js" ✅
- **Root Directory**: Set to **`frontend`** (this is important!)
  - Click "Edit" next to Root Directory
  - Change from `/` to `/frontend`
- **Build Command**: Leave as default (`npm run build`)
- **Output Directory**: Leave as default (`.next`)
- **Install Command**: Leave as default (`npm install`)

### Step 4: Deploy
1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. Your app will be live! 🎉

### Step 5: Get Your URL
After deployment completes, you'll get:
- **Production URL**: `fifa-simulation-xxxxx.vercel.app` (or custom name)
- **HTTPS**: Automatically enabled
- **Custom Domain**: Can be added later in project settings

## Automatic Deployments

Once deployed, Vercel will automatically:
- ✅ Deploy every time you push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Show build status in GitHub

## Alternative: Vercel CLI Deployment

If you prefer command line:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No (first time)
# - Project name? fifa-simulation (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No

# For production deployment
vercel --prod
```

## Alternative Platforms

### Netlify (Great Alternative)
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select `fifaSimulation` repository
5. **Important**: Set "Base directory" to `frontend`
6. Build command: `npm run build`
7. Publish directory: `.next`
8. Click "Deploy site"

### Cloudflare Pages
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign in and connect GitHub
3. Select `fifaSimulation` repository
4. **Important**: Set "Build output directory" to `frontend/.next`
5. Build command: `cd frontend && npm install && npm run build`
6. Click "Save and Deploy"

## Troubleshooting

### Issue: Build Fails
- **Solution**: Make sure "Root Directory" is set to `frontend` in Vercel settings

### Issue: 404 Errors
- **Solution**: Check that Next.js is properly detected (should show Next.js logo in Vercel dashboard)

### Issue: Module Not Found
- **Solution**: Ensure `package.json` is in the `frontend` directory and dependencies are listed

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] All tabs work (Groups, Matches, Standings, Bracket)
- [ ] Match simulation works
- [ ] localStorage persists data
- [ ] Bracket displays correctly after group stage completion

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually 5-10 minutes)

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Support: support@vercel.com

---

**Ready to deploy?** Start with Step 1 above! 🚀

