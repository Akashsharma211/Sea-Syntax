# Deployment Guide for MarineMetrics

This project is built on **Next.js 14 (App Router)** and connects to **MongoDB Atlas**. It is fully production-ready and optimized for zero-config deployment.

---

## 🚀 Recommended Deployment: Vercel (Fastest & Native for Next.js)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "feat: MarineMetrics SIH portal ready for production"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
   *(Note: `.env` and `.env.local` are automatically protected by `.gitignore`)*

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your `MarineMetrics` repository.

3. **Configure Environment Variables**:
   Under **Environment Variables**, add:

4. **Deploy**:
   - Click **Deploy**.
   - Vercel automatically builds and generates an optimized HTTPS URL (e.g. `https://marine-metrics.vercel.app`).

---

## 🌐 Alternative Deployment: Render / Railway / Node.js Host

1. **Build Command**:
   ```bash
   npm run build
   ```
2. **Start Command**:
   ```bash
   npm run start
   ```
3. **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `NODE_ENV`: `production`
   - `PORT`: Automatically set by the host (defaults to `3000`).

---

## 🔒 Security & Database Checklist

- [x] **MongoDB Atlas Whitelist**: Ensure your MongoDB Atlas cluster has IP Whitelist set to `0.0.0.0/0` (Allow access from anywhere) so cloud serverless instances (Vercel, Render, AWS) can connect without IP restrictions.
- [x] **Environment Variable Safety**: `.env` and `.env.local` are excluded via `.gitignore`. The template is available in `.env.example`.
- [x] **Serverless Connection Caching**: `lib/mongodb.js` caches database connections across serverless function invocations to prevent connection leaks.
- [x] **Dynamic Route Handling**: `/api/user` is configured with `export const dynamic = 'force-dynamic'` for reliable on-demand database requests.
