# 💠 CareerCraft AI // Neural Intelligence Platform

> **Accelerating Career Trajectories through Algorithmic Precision.**

CareerCraft AI is a high-performance, neural-themed career preparation ecosystem. It bridges the gap between candidates and recruiters by using advanced AI to deconstruct ATS filters and simulate realistic, conversational mock interviews.

---

## ⚡ Core Intelligence Protocols

### 📂 Smart Resume Analyzer (ATS-Sync)
*   **Neural Scanning:** Deconstructs PDF/Word documents using advanced text extraction.
*   **ATS Benchmarking:** Scores resumes against specific job descriptions with high-precision keyword mapping.
*   **Actionable Insights:** Provides "Protocol Upgrades" (recommendations) to bridge skill gaps.

### 🎥 AI Mock Interview Engine
*   **Adaptive Persona:** AI interviewers that adjust tone and difficulty based on your target role.
*   **Sentiment Analysis:** Evaluates not just what you say, but your confidence and delivery.
*   **Instant Evaluation:** Generates a comprehensive skill-dimension scorecard post-session.

### 📊 Neural Dashboard
*   **Progression Tracking:** Visualize your ATS score trends and interview mastery over time.
*   **Bento-Grid Architecture:** A premium, high-density UI designed for rapid data consumption.
*   **Neural Pulse Loading:** Custom high-speed loading states for a seamless data-sync experience.

### 📧 Corporate Contact Protocol
*   **Integrated Communication:** Fully functional contact system with database logging.
*   **Automated Dispatch:** Real-time notifications powered by **Resend** with premium Corporate-grade templates.

---

## 🛠️ Technology Architecture

### **Frontend Interface**
- **Framework:** React 19 + Vite (Next-Gen Performance)
- **Styling:** Tailwind CSS v4 & Framer Motion (Neural Animations)
- **Visualization:** Recharts (Dynamic Data Flow)
- **Identity:** React Router v7

### **Neural Backend**
- **Runtime:** Node.js + Express v5
- **Persistence:** Supabase (PostgreSQL with RLS)
- **Intelligence:** OpenAI GPT-4o API
- **Communications:** Resend API Integration
- **Processing:** Multer, PDF-Parse, Mammoth

---

## 🚀 Deployment Sequence

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **Supabase Project** (Database + Auth)
- **OpenAI API Key**
- **Resend API Key**

### 2. Environment Configuration

**Backend (`backend/.env`):**
```env
PORT=5000
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key # For admin tasks
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=your_official_email
```

**Frontend (`frontend/.env.local`):**
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Initialization
Execute the `supabase_schema.sql` in your Supabase SQL Editor to establish the neural core tables:
- `users` / `profiles`
- `resumes` / `ats_reports`
- `interviews`
- `contact_messages`

### 4. System Launch
```bash
# Start Backend
cd backend && npm install && npm start

# Start Frontend (New Terminal)
cd frontend && npm install && npm run dev
```

---

## 📐 Project Structure
```text
CareerCraft/
├── frontend/             # React Interface (Vite)
├── backend/              # Neural Engine (Node.js)
├── supabase_schema.sql   # Database Architecture
└── README.md             # System Documentation
```

---

**System: CareerCraft AI // Automated Communication Active**
