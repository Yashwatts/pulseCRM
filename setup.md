# PulseCRM AI: Local Setup & Usage Guide

Follow these instructions to run the PulseCRM AI stack locally on your machine.

## Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Running locally on port `27017` or a MongoDB Atlas URI)

---

## 1. Environment Configuration

You need to set up environment variables for the backend.
Create a `.env` file in the `backend/` directory:

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pulsecrm
JWT_SECRET=your_super_secret_jwt_key_123
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key
CHANNEL_SERVICE_URL=http://localhost:5001/dispatch
```

*Note: You must acquire a valid Gemini API Key from Google AI Studio for the Copilot features to work.*

---

## 2. Starting the Services

The application consists of three separate services that need to run concurrently. Open three separate terminal windows.

### Terminal 1: The Main CRM Backend
```bash
cd backend
npm install
npm run dev
```
*Runs on http://localhost:5000*

### Terminal 2: The Channel Service (Webhook Simulator)
```bash
cd channel-service
npm install
npm start
```
*Runs on http://localhost:5001*

### Terminal 3: The React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:5173*

---

## 3. Seeding the Database

For the CRM to be useful, it needs data. Once your MongoDB instance is running, open a terminal in the `backend` folder and run the seed script:

```bash
cd backend
npm run seed
```
This will automatically generate a highly realistic B2C Coffee Brand dataset, including 100 mock customers, 400 orders, pre-configured audience segments, historical campaigns, and webhook telemetry.

---

## 4. How to Use the Application

Once all three services are running, navigate to `http://localhost:5173`. You can create an account and log in. 

Here is what you can do on each page:

### 👥 Customers
- View the entire CRM database.
- Use the search bar to find specific users.
- Click the **"View"** button on any row to open the **Slide-out Drawer**, which displays that user's specific Lifetime Value (LTV), AI Tags, and mock Purchase History.

### 🎯 Segments (The Flagship Feature)
- This is the core AI-Native builder. You can toggle between **Manual Mode** (standard dropdowns) or **AI Builder**.
- In the AI Builder, type a Natural Language prompt (e.g., *"Find customers in Seattle who haven't ordered in 90 days"*). 
- The AI will automatically interpret your sentence, display the logic, show the live audience size, and even proactively recommend a marketing campaign to target them before you hit "Save".

### 🚀 Campaigns
- A premium 5-step Stepper UI for launching marketing blasts.
- Choose your Segment and Channel (Email, SMS, WhatsApp).
- Instead of typing an email yourself, input your **Goal**, **Tone**, and **Offer**. The Gemini AI will return structured JSON, auto-populating a Subject Line, Message Body, and CTA.
- The **Preview** step will show a beautiful mock iPhone or Web frame so you can see exactly how the message looks.
- Hitting **Launch** sends the batch to the isolated `Channel Service` on Port 5001.

### 📊 Analytics
- A real-time `Recharts` dashboard.
- Watch as the **Channel Service** processes delays and fires webhooks back to your CRM, updating the Delivery, Open, and Click rates live on the screen.
- Features an Engagement Funnel chart and an AI Insights panel that dynamically reads the telemetry.

### 🤖 AI Assistant (Pulse Copilot)
- A dedicated ChatGPT-style chat interface.
- It is fully context-aware. Because it is securely hooked into the backend, you can ask it questions like *"Summarize my analytics"*, and it will know exactly how much revenue your CRM has tracked and how many active campaigns you are running.
