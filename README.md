# PulseCRM AI 🚀

An enterprise-grade, AI-native Marketing CRM built to demonstrate Senior-level architectural scaling, modern React/Node engineering, and distributed systems design.

Unlike traditional CRMs that require complex querying knowledge, PulseCRM AI leverages Google Gemini to act as an omniscient Marketing Copilot—translating natural language into secure database rules, structuring campaign copy, and analyzing funnel telemetry in real-time.

## 🏗 System Architecture

PulseCRM is built on a **Monolith + Worker** microservice pattern to ensure high-throughput availability.

- **Frontend (React / Vite):** A blazing fast SPA styled with `TailwindCSS` and `shadcn/ui` to achieve a premium, Stripe/Linear aesthetic. Handles server-state and live polling using `TanStack React Query`.
- **Main Backend (Node.js / Express / TypeScript):** The central orchestrator. It manages JWT Authentication, queries MongoDB Atlas, sanitizes AI payloads to prevent NoSQL injection, and safely dispatches massive campaign loads.
- **Channel Service (Express Simulator):** A standalone microservice running on a separate port. It simulates a third-party vendor (like Twilio) by accepting batch requests, applying randomized asynchronous delays, computing weighted marketing funnels, and firing Webhook Callbacks back to the main CRM using an **Exponential Backoff Retry** mechanism.

## ✨ Flagship Features

1. **AI-Native Segment Builder:** Marketers simply type *"Find customers in Seattle who spent over $500 but haven't ordered in 90 days"*. The backend LLM translates this into a strictly validated JSON structure, and securely converts it into a Mongoose aggregation. It even proactively suggests Win-Back campaigns before you hit save.
2. **Context-Aware Pulse Copilot:** A ChatGPT-style chat interface that maintains multi-turn history. Behind the scenes, the backend intercepts every message, queries MongoDB, and silently injects live business metrics (Revenue, Delivery Rates, Customer Count) into the system prompt, allowing the AI to give highly accurate analytical advice.
3. **Decoupled AI Campaign Stepper:** A premium 5-step UI that decouples AI "Generation" from database "Saving". You supply a Goal, Tone, and Offer. The AI returns a strict JSON contract that cleanly populates the Subject, Message, and CTA fields. You can visualize the result immediately in a mock iPhone / Browser preview frame.
4. **Real-time Analytics Dashboard:** Built with `Recharts`. As the isolated Channel Service processes messages and fires Idempotent Webhooks, the React frontend polls the CRM and dynamically updates your Delivery Rates, Click-Through Rates, and Engagement Funnels live on the screen.

## 📚 Project Documentation

The repository contains extensive documentation answering the "Why" behind the technical decisions:

1. **`setup.md`** - A complete step-by-step guide on how to configure your environment variables, spin up the 3 services, seed the database, and test the features.
2. **`deployments.md`** - A production deployment playbook for hosting the architecture on Vercel, Render, and MongoDB Atlas.
3. **`questions.md`** - A rigorous interview preparation document featuring 20 Senior Engineer Q&A's defending the design choices (e.g., *Why not Redux? Why $inc for Analytics? How to fix Node.js OOM crashes during scale?*)
4. **`explanation.md`** - The definitive blueprint outlining the MongoDB database schema, the product philosophy, and an embedded Mermaid Architecture diagram.

## 🛠 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Recharts, Framer Motion
- **Backend:** Node.js, Express, TypeScript, Mongoose
- **Database:** MongoDB
- **AI Engine:** Google Gemini (gemini-2.5-flash)
- **Security:** JWT Auth, Bcrypt hashing, Strict CORS, Idempotency Locks

*Designed and engineered for the Xeno technical assignment.*