# CareerCraft AI - Backend

Secure Express backend for the CareerCraft AI platform.

## Features
- **Secure Authentication**: Integration with Supabase JWT and Role-Based Access Control.
- **AI Interview Engine**: Powered by Tavus API for real-time video avatars, OpenAI Whisper for transcribing responses, and GPT-4o-mini for multi-dimensional scorecard analysis.
- **Smart ATS Grader**: Custom PDF parser combined with GPT qualitative grading to evaluate keyword density, formatting, and structural scores.
- **Acoustic Speech Analysis**: Direct frequency and hesitation metrics processing via local Python analysis (`librosa`).
- **Interactive Practice Drills**: Generative STAR Story and Elevator Pitch evaluation modules.
- **Corporate Contact Center**: Integrated with Resend API for transactional email forwarding.

---

## API Endpoints

### 1. Dashboard
* **`GET /api/dashboard/stats`** - Retrieves user statistics, including aggregate ATS averages, interview counts, historical trends, and scorecard comparisons.

### 2. Resumes
* **`GET /api/resumes/latest`** - Fetch the user's most recently uploaded resume and ATS grading scorecard.
* **`GET /api/resumes`** - Retrieve a history list of all previously graded resumes.
* **`POST /api/resumes/upload`** - Accepts PDF file, extracts text, grades against ATS benchmarks using OpenAI, and stores records in Supabase.

### 3. Interviews
* **`GET /api/interviews`** - Fetch past interview archives (scorecards, strengths/weaknesses list, and full user/interviewer transcript dialogue).
* **`POST /api/interviews/initialize`** - Set up Tavus API video streaming sessions, prepopulate custom job position questions, and link summary profile.
* **`POST /api/interviews/evaluate`** - Submits speech data for comprehensive GPT evaluation (overall score, relevance, communication) and stores results.
* **`GET /api/interviews/recommendations`** - Retrieves targeted practice exercises based on interview feedback.

### 4. Training & Drills
* **`POST /api/training/star`** - Grade user answers against the STAR method (Situation, Task, Action, Result).
* **`POST /api/training/elevator`** - Evaluate short elevator pitch submissions.
* **`POST /api/training/drill`** - Generates dynamic live roleplay mock questions.

### 5. Corporate Contact
* **`POST /api/contact`** - Dispatches emails from the contact form using the Resend service.

---

## Setup & Local Installation

### Prerequisites
- **Node.js** (v18+)
- **Python 3.8+** (For local sound processing)
- **ffmpeg** installed on host machine path (For WebM audio conversion)

### Quick Start
1. Clone the repository.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   TAVUS_API_KEY=your_tavus_key
   RESEND_API_KEY=your_resend_key
   ADMIN_EMAIL=your_official_email
   ```
5. Spin up the local development server:
   ```bash
   npm start
   ```
