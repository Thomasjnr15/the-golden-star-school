# Deployment Guide - Golden Star School Management System

This guide covers deploying the Golden Star School Management System to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase project created and schema deployed
- [ ] RLS policies enabled on all tables
- [ ] Admin account created in database
- [ ] Test login works (admin and student)
- [ ] All features tested in development
- [ ] Code committed to GitHub
- [ ] No sensitive data in repository

## 🚀 Deployment Options

### Option 1: Manus (Recommended - Built-in Hosting)

Manus provides built-in hosting with automatic HTTPS, CDN, and custom domains.

#### Steps:

1. **Create Checkpoint** (in Manus UI):
   - Go to Management UI → Code panel
   - Click "Create Checkpoint" button
   - Add description: "Production deployment v1.0"

2. **Publish**:
   - Click "Publish" button (appears after checkpoint)
   - Wait for deployment to complete
   - Your site is live at `{project-name}.manus.space`

3. **Custom Domain** (optional):
   - Management UI → Settings → Domains
   - Add custom domain or purchase new one
   - Follow DNS setup instructions

#### Environment Variables (Auto-Injected):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

No manual setup needed - Manus handles this automatically.

---

### Option 2: Vercel (Recommended - Free Tier)

Vercel provides free hosting with excellent performance.

#### Prerequisites:
- GitHub account with repository pushed
- Vercel account (free at vercel.com)

#### Steps:

1. **Push to GitHub**:
```bash
cd /home/ubuntu/golden-star-school
git add .
git commit -m "Production ready: Golden Star School v1.0"
git push origin main
```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select "golden-star-school"

3. **Configure Build Settings**:
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these variables:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Apply to: Production, Preview, Development

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your site is live at `{project-name}.vercel.app`

6. **Custom Domain** (optional):
   - Project Settings → Domains
   - Add your domain
   - Update DNS records

#### Cost:
- Free tier: Unlimited deployments, 100GB bandwidth/month
- Pro tier: $20/month for additional features

---

### Option 3: Netlify

Netlify provides free hosting with built-in CI/CD.

#### Steps:

1. **Push to GitHub** (same as Vercel)

2. **Connect to Netlify**:
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub
   - Select repository

3. **Configure Build Settings**:
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: 18

4. **Add Environment Variables**:
   - Site settings → Build & deploy → Environment
   - Add variables:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Deploy**:
   - Click "Deploy site"
   - Your site is live at `{project-name}.netlify.app`

#### Cost:
- Free tier: 100GB bandwidth/month
- Pro tier: $19/month

---

### Option 4: Self-Hosted (Docker)

For complete control, deploy using Docker.

#### Prerequisites:
- Docker installed on server
- Server with Node.js or Docker support
- Domain name (optional)

#### Steps:

1. **Create Dockerfile** (in project root):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
```

2. **Create .dockerignore**:
```
node_modules
.git
.env.local
dist
.manus-logs
```

3. **Build Docker Image**:
```bash
docker build -t golden-star-school:latest .
```

4. **Run Container**:
```bash
docker run -d \
  --name golden-star-school \
  -p 3000:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  golden-star-school:latest
```

5. **Setup Reverse Proxy** (Nginx):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Setup SSL** (Let's Encrypt):
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 5: Railway

Railway provides simple deployment with pay-as-you-go pricing.

#### Steps:

1. **Push to GitHub**

2. **Connect to Railway**:
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select repository

3. **Configure**:
   - Add environment variables
   - Build command: `pnpm build`
   - Start command: `pnpm start`

4. **Deploy**:
   - Railway automatically deploys
   - Get URL from project dashboard

#### Cost:
- Free tier: $5 credit/month
- Pay-as-you-go: $0.000116/CPU-hour

---

## 🔐 Production Security Checklist

### Supabase Security

1. **Enable RLS on all tables**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify all tables have RLS enabled

2. **Rotate API Keys**:
   - Supabase Dashboard → Project Settings → API Keys
   - Rotate anon key quarterly

3. **Enable 2FA** (for admin accounts):
   - Supabase Dashboard → Authentication → Providers
   - Enable 2FA for admin users

4. **Backup Database**:
   - Supabase Dashboard → Backups
   - Enable daily backups

### Application Security

1. **Use HTTPS Only**:
   - All platforms above provide free HTTPS
   - Redirect HTTP to HTTPS

2. **Set Security Headers**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

3. **Content Security Policy**:
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
```

4. **Rate Limiting**:
   - Configure in Supabase or reverse proxy
   - Limit login attempts to 5 per minute

5. **Monitor Logs**:
   - Enable audit logging
   - Review logs regularly for suspicious activity

---

## 📊 Post-Deployment

### Monitoring

1. **Uptime Monitoring**:
   - Use UptimeRobot (free tier available)
   - Get alerts if site goes down

2. **Error Tracking**:
   - Enable error logging in browser console
   - Monitor Supabase logs

3. **Performance Monitoring**:
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals

### Maintenance

1. **Regular Backups**:
   - Supabase: Enable automatic backups
   - Database: Export monthly backups

2. **Update Dependencies**:
   - Run `pnpm update` monthly
   - Test updates in development first

3. **Security Updates**:
   - Monitor npm security advisories
   - Apply critical patches immediately

---

## 🆘 Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Environment Variables Not Loading
- Verify variable names match exactly
- Check for typos in variable names
- Restart deployment after adding variables

### Supabase Connection Issues
- Verify URL and key are correct
- Check Supabase project is active
- Ensure RLS policies allow access

### Performance Issues
- Enable CDN caching
- Optimize images
- Use database indexes
- Monitor query performance

### SSL Certificate Issues
- Verify domain DNS is configured
- Wait 24-48 hours for DNS propagation
- Renew certificates before expiration

---

## 📞 Support Resources

- **Manus Docs**: https://docs.manus.im
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Docker Docs**: https://docs.docker.com

---

## 🎉 Deployment Complete!

Your Golden Star School Management System is now live in production. 

**Next Steps:**
1. Share login credentials with admin staff
2. Import student data
3. Create exams and questions
4. Test all features with real users
5. Gather feedback and iterate

**Congratulations! 🎓**
