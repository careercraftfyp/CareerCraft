# CareerCraft AI

CareerCraft AI is a comprehensive, AI-powered career preparation platform designed to help job seekers optimize their resumes and practice for interviews.

## Features

- **Smart Resume Checker (ATS Analysis):** Upload your resume (PDF/Word), enter a target job description, and receive an ATS match score along with actionable feedback on missing keywords to improve your chances of getting past automated systems.
- **AI-Powered Mock Interviews:** Practice interviewing using your microphone and camera. The platform generates context-aware questions based on your resume, target job role, and chosen difficulty level. 
- **Interview Evaluation:** After an interview session, receive a detailed scorecard evaluating your communication skills, technical knowledge, content relevance, and overall performance.
- **User Dashboard:** Track your progress over time, visualize your resume score trends, and review past interview performances.

## Technology Stack

**Frontend:**
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 & Framer Motion
- **Data Visualization:** Recharts
- **Routing:** React Router v7

**Backend:**
- **Framework:** Node.js + Express v5
- **Database & Auth:** Supabase (PostgreSQL)
- **AI Integration:** OpenAI API
- **Live Video/Audio:** LiveKit Server SDK
- **File Processing:** Multer, PDF-Parse, Mammoth

## Project Structure

```
CareerCraft/
├── frontend/             # React (Vite) frontend application
├── backend/              # Node.js Express server
└── supabase_schema.sql   # Database schema for Supabase
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Supabase account and project
- OpenAI API Key
- LiveKit Cloud account

### Environment Variables setup

**Backend (`backend/.env`):**
Create a `.env` file in the `backend` directory with the necessary keys:
```env
PORT=5000
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# External APIs
OPENAI_API_KEY=your_openai_api_key
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

**Frontend (`frontend/.env.local`):**
Create a `.env.local` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

### Installation & Execution

1. **Setup the Database:**
   - Run the provided `supabase_schema.sql` script in your Supabase project's SQL editor. This sets up the users, resumes, ats_reports, and interviews tables along with the Row Level Security (RLS) policies.

2. **Start the Backend server:**
   ```bash
   cd backend
   npm install
   npm run start
   ```

3. **Start the Frontend development server:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open the Application:**
   Visit `http://localhost:5173` in your browser.
