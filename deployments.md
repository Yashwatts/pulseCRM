# PulseCRM AI: Production Deployment Guide

This document outlines the step-by-step production deployment process for the PulseCRM AI architecture. The application is built with a separated Frontend (Vite/React) and Backend (Node.js/Express) to ensure optimal scaling.

## Recommended Infrastructure
- **Frontend:** [Vercel](https://vercel.com/) (Edge-optimized static hosting)
- **Backend (Main CRM & Channel Service):** [Render](https://render.com/) or Railway (Dockerized container hosting)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed Cloud DB)

---

## 1. Database Setup (MongoDB Atlas)

1. Create a free shared cluster on MongoDB Atlas.
2. Under **Network Access**, click "Add IP Address" and select `Allow Access from Anywhere` (`0.0.0.0/0`). *(Note: In a true enterprise environment, you would VPC peer your database to Render, but `0.0.0.0/0` is required for simple take-home deployment).*
3. Under **Database Access**, create a new database user and securely save the password.
4. Click **Connect** -> **Connect your application** and copy the Connection String URI.
   - Example: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pulsecrm?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render)

We need to deploy two separate Web Services on Render: the Main CRM Backend and the Channel Service Webhook Simulator.

### Service A: Main CRM Backend
1. In the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the build settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build` *(Requires adding `"build": "tsc"` to package.json scripts if not present)*
   - **Start Command:** `npm start` *(Requires adding `"start": "node dist/index.js"` or `ts-node src/index.ts` to package.json scripts)*
4. Configure **Environment Variables** for the Main Backend:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `[Your MongoDB Atlas URI]`
   - `JWT_SECRET` = `[A highly secure random 64-character string]`
   - `FRONTEND_URL` = `[The URL where your Vercel frontend will live, e.g., https://pulsecrm.vercel.app]`
   - `GEMINI_API_KEY` = `[Your Google Gemini API Key]`
   - `CHANNEL_SERVICE_URL` = `[Leave blank for now, you will update this after deploying Service B]`

### Service B: Channel Service Simulator
1. Create a second **Web Service** on Render pointing to the same repository.
2. Configure the build settings:
   - **Root Directory:** `channel-service`
   - **Build Command:** `npm install`
   - **Start Command:** `npx ts-node src/index.ts`
3. Configure **Environment Variables** for the Channel Service:
   - `CRM_WEBHOOK_URL` = `https://[RENDER_MAIN_BACKEND_URL]/api/webhooks/delivery`
4. Deploy the service and copy its live URL.
5. **CRITICAL STEP:** Go back to **Service A (Main CRM Backend)** and update its environment variables to point to the new channel service:
   - Set `CHANNEL_SERVICE_URL` = `https://[RENDER_CHANNEL_SERVICE_URL]/dispatch`

### Backend Health Check Verification
Once deployed, verify both services are running:
- Main Backend: `https://[RENDER_MAIN_BACKEND_URL]/health` (Should return `{ "status": "ok", "service": "crm-backend" }`)
- Channel Service: `https://[RENDER_CHANNEL_SERVICE_URL]/health` (Should return `{ "status": "ok", "service": "channel-service" }`)

---

## 3. Frontend Deployment (Vercel)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure the build settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Configure **Environment Variables** for the Frontend:
   - `VITE_API_URL` = `https://[RENDER_MAIN_BACKEND_URL]/api` *(Crucial: Include the `/api` path)*
5. Click **Deploy**.

---

## 4. Production Security & Architecture Checklist

Before considering the deployment "Production Ready", ensure the following:

- [x] **CORS Configuration:** The backend CORS is strictly locked down using `process.env.FRONTEND_URL` to reject unauthorized cross-origin requests.
- [x] **Password Hashing:** `bcryptjs` is successfully hashing passwords prior to MongoDB storage.
- [x] **JWT Expiration:** Tokens are configured with strict expiration timeouts.
- [x] **Idempotency:** The `/api/webhooks/delivery` route contains logic to reject duplicate statuses, preventing Analytics corruption if the Channel Service retries a payload due to network instability.
- [x] **Asynchronous Dispatch:** The Channel Service returns an immediate `202 Accepted` before processing the array of messages to avoid blocking the CRM's Node.js event loop.
- [x] **Database Indexing:** Mongoose schemas have compound indexes applied to `campaignId` and `status` to ensure analytics aggregation queries execute in `O(log N)` time.

## 5. First-Time Setup (Seeding the Database)
Once the database is deployed, you should populate it with the mock data so the Analytics Dashboard functions immediately.
If you have access to the Render terminal (Shell tab) for the Main Backend:
1. Run: `npm run seed`
2. Wait for the success message: `✅ Database successfully seeded with PulseCRM Coffee Brand Data!`
