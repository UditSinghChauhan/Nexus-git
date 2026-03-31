# Deployment Guide

## Environment Configuration

### Backend

1. Set these environment variables on your production server:
   - `NODE_ENV=production`
   - `PORT` - Server port (default: 3000)
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET_KEY` - Secure JWT signing key
   - `OPENAI_API_KEY` - OpenAI API key for AI features
   - `FRONTEND_URL` - Primary production frontend URL
   - `FRONTEND_URLS` - Optional comma-separated list of additional allowed frontend origins
   - `BACKEND_PUBLIC_URL` - Public backend URL for server-side Socket.io fallback
   - `VCS_WORKSPACE_ROOT` - Optional path to the active VCS workspace when it should live outside the backend source folder
   - `AWS_REGION` - AWS region if using S3 push/pull features
   - `S3_BUCKET` - S3 bucket name if using push/pull features

Example:
```bash
export NODE_ENV=production
export PORT=3000
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gitnexus
export JWT_SECRET_KEY=your-secure-key-here
export OPENAI_API_KEY=sk-...
export FRONTEND_URL=https://app.gitnexus.com
export FRONTEND_URLS=https://app.gitnexus.com,https://www.gitnexus.com
export BACKEND_PUBLIC_URL=https://api.gitnexus.com
export VCS_WORKSPACE_ROOT=/srv/gitnexus-demo
export AWS_REGION=ap-south-1
export S3_BUCKET=your-gitnexus-bucket
```

2. Install dependencies and start:
```bash
npm install
npm run start  # or use PM2 for process management
```

### Frontend

1. Build the production bundle:
```bash
npm install
npm run build
```

2. Set `VITE_API_URL` to your production backend:
```bash
export VITE_API_URL=https://api.gitnexus.com
npm run build
```

3. Deploy the `dist/` folder to your hosting service (Vercel, Netlify, AWS S3+CloudFront, etc.)

## Production Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] OpenAI API key provisioned
- [ ] Backend environment variables configured
- [ ] Frontend `VITE_API_URL` points to production backend
- [ ] CORS `FRONTEND_URL` / `FRONTEND_URLS` configured correctly
- [ ] `PATCH` requests work from the browser for repo updates
- [ ] `BACKEND_PUBLIC_URL` set when deploying backend separately
- [ ] Backend running behind a reverse proxy (nginx/Apache) with HTTPS
- [ ] Frontend served with proper caching headers
- [ ] Health endpoint responds: `GET /health`

## Smoke Test After Deploy

1. Sign up for a new account
2. Log in with the new account
3. Create a test repository
4. Verify real-time updates with Socket.io
5. Test AI features (commit message, diff explanation)
6. Check network requests for proper CORS headers

## Hosting Options

### Backend
- **Heroku** - Simple deployment with `Procfile`
- **AWS EC2** - Virtual machine with Node.js runtime
- **Railway/Render** - Simplified deployment platforms
- **DigitalOcean** - VPS with app platform

### Frontend
- **Vercel** - Optimized for Vite/React builds
- **Netlify** - Continuous deployment from Git
- **AWS S3 + CloudFront** - CDN-backed static hosting
- **GitHub Pages** - Free static hosting

## Monitoring

Monitor your `/health` endpoint to ensure production readiness:
```bash
curl https://api.gitnexus.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-30T20:30:00.000Z",
  "uptime": 3600,
  "mongodb": "connected"
}
```

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend domain exactly
- If you use more than one frontend hostname, set `FRONTEND_URLS` as a comma-separated list
- Check Socket.io CORS configuration includes your frontend origin

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist on MongoDB Atlas
- Ensure network connectivity from server to Atlas

### AI Features Not Working
- Verify `OPENAI_API_KEY` is valid
- Check API rate limits on OpenAI account
- Review error logs for API errors

### S3 Push/Pull Not Working
- Verify `S3_BUCKET` and `AWS_REGION` are configured
- Ensure the deployed environment has AWS credentials with S3 access
