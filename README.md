# MeterPrompt — AI Gateway & SaaS Metered Billing Platform

**MeterPrompt** is an OpenRouter-style AI reverse-proxy gateway and SaaS metered billing platform. It offers unified model routing, real-time token tracking, cryptographic API key authentication, and an enterprise billing engine with automated mid-cycle proration adjustments.

---

## 🌟 Key Architectural Highlights

- **OpenAI-Compatible AI Proxy Gateway (`/api/v1/chat/completions`):**
  - High-throughput routing for top-tier LLMs (`gpt-4o`, `claude-3-5-sonnet`, `deepseek-r1`, `gpt-4o-mini`).
  - Supports both **Live AI Provider Mode** (OpenAI API key passthrough) and **Mock Provider Engine** for offline development & load testing.

- **Granular Metered Usage & Token Quota Engine:**
  - Real-time token consumption calculation (prompt + completion tokens).
  - Monthly quota enforcement per subscription tier with zero-margin overage billing automatically deducted from user credit balance.

- **Enterprise Multi-Tier Subscription & Proration Engine:**
  - **3 Core Tiers:** Starter ($19.99/mo), Pro ($49.99/mo), Max ($199.99/mo).
  - **Tenure Flexibility:** Supports Monthly & Annual billing cycles (20% discount on yearly plans).
  - **Cycle-Aware Mid-Cycle Proration:** Automatic calculation of unused plan value credit when upgrading or downgrading between tiers mid-month.

- **Cryptographic Key Security & RBAC:**
  - Secure API keys (`mp_live_...`) with one-way SHA-256 database hashing.
  - JWT session authentication and Role-Based Access Control (Developer vs. Billing Admin).

- **Modern Developer Console & Billing UI:**
  - **Collapsible Left-Edge Hover Drawer Navigation.**
  - **OpenRouter-Style Generation Logs** with latency metrics and token count breakdowns.
  - **Animated Receipt Modal** with interactive confetti card feedback.
  - **Client-Side PDF Invoice Generation** for instant download and printing.

---

## 🛠️ Tech Stack Matrix

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend API** | Node.js, Express.js, Express-Validator, Helmet, CORS |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 |
| **Authentication & Security** | JSON Web Tokens (JWT), Bcrypt, Crypto (SHA-256) |
| **Proxy Engine** | Custom HTTP Axios / Native Fetch Proxy Dispatcher |

---

## 🚀 Local Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Cluster URI

---

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/meter-prompt.git
cd meter-prompt
```

---

### 2. Server Configuration & Environment Setup

```bash
# Navigate to server directory
cd server

# Install server dependencies
npm install

# Create .env from template
cp .env.example .env
```

Ensure `server/.env` contains valid credentials:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@cluster0.kdmhznz.mongodb.net/meterprompt?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_meterprompt_2026
JWT_EXPIRES_IN=7d
AI_PROXY_MODE=mock
```

---

### 3. Client Setup

```bash
# Navigate to client directory
cd ../client

# Install client dependencies
npm install
```

---

### 4. Database Seeding & Launch

From the root directory:

**Start Backend Server (Port 5000):**
```bash
cd server
npm start
```

**Start Frontend Development Server (Port 3000):**
```bash
cd client
npm run dev
```

---

## 📡 API Specification & cURL Quickstart

Send an OpenAI-compatible request through the MeterPrompt AI Proxy Gateway:

```bash
curl -X POST http://localhost:5000/api/v1/chat/completions \
  -H "Authorization: Bearer mp_live_your_generated_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Explain metered SaaS billing in two sentences." }
    ],
    "temperature": 0.7
  }'
```

### Sample Gateway Response:
```json
{
  "id": "chatcmpl-meterprompt-849204",
  "object": "chat.completion",
  "created": 1773014400,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Metered SaaS billing charges customers based on their actual resource consumption rather than a fixed flat fee. This aligns software cost directly with the value and volume used by developers."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 36,
    "total_tokens": 60
  }
}
```

---

## 📄 License

Distributed under the MIT License. Built for scalable AI application infrastructure.
