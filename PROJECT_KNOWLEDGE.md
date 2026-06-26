# CareerCraft AI — Complete Technical & Logical Knowledge Base

A deep-dive reference covering every service, algorithm, route, and integration in the platform.

---

## 1. Core Architecture

CareerCraft AI uses a modern, fully separated client-server architecture:

### Frontend (Vite + React + Tailwind CSS)
- Handles all UI, client-side routing (React Router v6), and user interactions.
- Communicates with the backend **exclusively via REST API** calls using the native `fetch` API (no Axios).
- Auth state is managed globally through a custom **`AuthProvider`** React context (`AuthContext.jsx`) that wraps the entire app.
- Route-level access control is enforced via a **`ProtectedRoute`** component that redirects unauthenticated users to `/login`.
- Uses **Framer Motion** (`motion`, `AnimatePresence`) for page transitions and micro-animations.
- Uses **Lucide React** for all iconography.
- Public pages: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/services`, `/pricing`, `/about`, `/contact`.
- Protected pages (require login): `/dashboard`, `/resume`, `/interview`, `/interview/report/:sessionId`, `/profile`.
- Hidden Admin page (custom client-side auth): `/cc-admin`.

### Backend (Node.js + Express)
- Serves as the central **orchestrator** between the React frontend and all external services (OpenAI, Tavus, Supabase, Resend).
- Runs on port `5000` by default (configurable via `PORT` env variable).
- Entry point: `backend/src/index.js`.
- Uses `cors` and `express.json()` middleware globally.
- **All protected routes** are secured by the `requireAuth` middleware (`backend/src/middleware/auth.js`), which validates a Supabase JWT Bearer token from the `Authorization` header and attaches `req.user` to the request.

### Database & Auth (Supabase)
- **PostgreSQL database** for all persistent data.
- **Supabase Auth** handles the full signup/login flow (email + password, plus **Google OAuth**).
- A PostgreSQL **Trigger** (`on_auth_user_created`) automatically inserts a row into `public.users` whenever a new user registers via Supabase Auth.
- **Row Level Security (RLS)** is enforced at the database level on all tables, making it impossible for a user to access another user's data even if the frontend or API were compromised.

### Email Service (Resend)
- Contact form submissions are sent as styled HTML emails via the **Resend API** (`/api/contact` route).
- Contact messages are also persisted to the `contact_messages` Supabase table simultaneously.

### AI Video Interviewer (Tavus)
- Real-time video AI interviews are powered by **Tavus**.
- The backend creates a **Tavus Conversation** via `POST https://tavusapi.com/v2/conversations`.
- A persona (`DEFAULT_PERSONA_ID`) and replica (`DEFAULT_REPLICA_ID`) are configured on the Tavus platform.
- Tavus returns a `conversation_url` which is embedded directly in the frontend as an `<iframe>` — no WebRTC SDK required on the client side.

---

## 2. Authentication Flow (Deep Dive)

**`AuthContext.jsx`** exposes these methods to every component via `useAuth()`:

| Method | Description |
|---|---|
| `signUp(email, password, fullName)` | Calls `supabase.auth.signUp` with `full_name` in metadata, which the DB trigger picks up. |
| `signIn(email, password)` | Calls `supabase.auth.signInWithPassword`. |
| `signInWithGoogle()` | Calls `supabase.auth.signInWithOAuth` with `provider: 'google'`, redirects to `/dashboard` on success. |
| `signOut()` | Calls `supabase.auth.signOut`. |
| `resetPassword(email)` | Calls `supabase.auth.resetPasswordForEmail`, sending a link to `/reset-password`. |
| `updatePassword(newPassword)` | Calls `supabase.auth.updateUser`. Used on the `ResetPassword` page. |

**Session persistence**: `AuthContext` calls `supabase.auth.getSession()` on mount and subscribes to `supabase.auth.onAuthStateChange` to keep the `user` state in sync across tabs and page refreshes.

**Backend token validation** (`requireAuth` middleware):
1. Reads the `Authorization: Bearer <token>` header.
2. Calls `supabase.auth.getUser(token)` to verify the JWT with Supabase's servers.
3. On success, attaches the full `user` object to `req.user` and calls `next()`.
4. On failure, returns `401 Unauthorized`.

---

## 3. ATS Resume Grader (Deep Dive)

**Route:** `POST /api/resumes/upload`  
**File:** `backend/src/routes/resumes.js`

### Step-by-Step Pipeline

1. **File Upload & Validation**: Multer is configured with `memoryStorage()` and a 5MB limit, PDF-only filter. The file never touches disk.

2. **Text Extraction**: The PDF buffer is passed to `pdf-parse` to extract raw text. If the result is under 50 characters, the request is rejected.

3. **Deterministic ATS Scoring** (`backend/src/utils/atsParser.js` → `parseResume()`):
   This custom algorithm mimics a real ATS and produces a mathematical score using:
   - **Regex-based contact detection**: Email, phone number, LinkedIn URL, GitHub URL.
   - **Section detection**: Checks for `Education`, `Experience`/`Work History`, `Skills`, `Summary`/`Profile`.
   - **Bullet point analysis**: Extracts all bullet points (starting with `•`, `-`, or `*`).
   - **Impact Score**: Calculates the percentage of bullets containing `$`, `%`, or large numbers (≥2 digits). Scaled so that 30%+ metric coverage = 100.
   - **Action Verbs Score**: Checks if the first word of each bullet matches a hardcoded list of 25+ strong action verbs (e.g., `spearheaded`, `optimized`, `maximized`). Scaled so that 50%+ = 100.
   - **Field Detection**: Keyword matching to categorize as `Software Engineering / Tech`, `Marketing / Sales`, `Finance`, or `General Professional`.
   - **Skill Extraction**: Scans for 15 common skills (JavaScript, Python, React, SQL, AWS, Docker, etc.).
   - **Overall Score**: `Math.round((atsCompatibilityScore + impactScore + actionVerbsScore) / 3)`.

4. **AI Enhancement** (OpenAI `gpt-4o-mini`):
   A strict JSON-only prompt sends the first 4,000 characters of the resume text to OpenAI, requesting:
   - `missing_critical_keywords`: Career-specific keywords absent from the resume.
   - `critical_errors`: `[{ issue, fix }]` array.
   - `formatting_warnings`: Array of strings.
   - `actionable_feedback`: Array of personalized rewrite suggestions.
   
   The AI feedback is **merged** with the algorithm's output — scores stay deterministic, but the qualitative feedback becomes AI-personalized. If OpenAI fails, the algorithmic feedback is used as a fallback.

5. **Storage**: The result is saved to the `resumes` table as a JSON blob in the `parsed_text` column: `{ extractedText: "...", analysis: {...} }`. This is a schema workaround since the column is a TEXT type.

6. **API Response**: Returns `{ message, fileName, analysis, parsedTextPreview, fullText }`.

**Additional resume routes:**
- `GET /api/resumes/latest` — Fetches the most recently uploaded resume for the authenticated user.
- `GET /api/resumes/` — Fetches the full resume history for the user.

---

## 4. AI Mock Interview System (Deep Dive)

**File:** `backend/src/routes/interviews.js`

The interview pipeline uses **Tavus** for the live AI video agent, and **OpenAI Whisper** for post-interview audio transcription.

### Phase 1: Session Initialization
**Route:** `POST /api/interviews/initialize`

1. **Input**: `position`, `field`, `difficulty`, `mode`, `company`, `jobDescription`, `resumeText`.
2. **Question + Resume Summary Generation** (OpenAI `gpt-4o-mini`):
   - A single OpenAI call generates **2 things simultaneously** in a `json_object` response:
     - `questions`: An array of **6 structured interview questions** (intro → technical → behavioral → closing), calibrated to the job role, field, difficulty, company, and job description.
     - `resumeSummary`: **5 ultra-dense bullet points** condensing the candidate's resume, used to brief the AI interviewer.
   - Fallback: If parsing fails, 6 generic questions are substituted.
3. **Database Record**: A new row is inserted into `interviews` with `status: 'in_progress'`.
4. **Tavus Conversation Creation**:
   - A rich `conversational_context` is built — it programs the AI interviewer's personality as a "Senior Director of Talent", instructing it on brevity, pacing, probing behavior, and affirmation avoidance.
   - A custom `custom_greeting` is set for the opening line.
   - Properties include `max_call_duration: 3600`, `enable_recording: true`, `language: 'english'`.
   - The Tavus `conversation_id` is saved back to the database row.
5. **Response to Frontend**: `{ sessionId, conversationId, conversationUrl, questions, meta }`.

### Phase 2: The Live Interview Session
- The frontend (`InterviewSession.jsx`) receives the `conversationUrl` and renders it in a full-screen `<iframe>`.
- **Simultaneously**, the browser's `MediaRecorder` API starts capturing the candidate's microphone audio (`audio/webm`, 1-second chunks) in the background.
- A tactical sidebar shows: mic toggle, latency indicator, deployment context, and tactical tips.
- The user ends the session by clicking "End & Analyze".

### Phase 3: Ending & Evaluation
**Route:** `POST /api/interviews/:conversationId/end`

1. Calls `POST https://tavusapi.com/v2/conversations/:id/end` to terminate the Tavus session.

**Route:** `POST /api/interviews/:sessionId/evaluate`

2. The frontend collects the recorded audio `Blob` and POSTs it as `multipart/form-data`.
3. **Whisper Transcription**: The audio file is renamed to `.webm` on disk and streamed to OpenAI's `whisper-1` model for English transcription. The temp file is cleaned up afterward.
4. **Evaluation** (OpenAI `gpt-4o-mini`): The transcript is evaluated against the original interview questions, producing JSON with:
   - `overallScore` (0-100)
   - `communicationScore` (0-100)
   - `contentRelevanceScore` (0-100)
   - `strengths` (2-3 strings)
   - `improvements` (2-3 actionable strings)
   - `feedback` (2-3 sentence summary)
5. **Database Update**: `transcript`, `evaluation`, `status: 'completed'` are saved.
6. **Fallback (no audio)**: If no audio file is detected, a zero-score fallback evaluation is saved and returned immediately.
7. **Background Action**: After ending, the frontend fires a **fire-and-forget** `GET /api/interviews/recommendations` call to pre-generate new practice drills.

### Phase 4: Report Retrieval
**Route:** `GET /api/interviews/:sessionId/report`
- Polls for completion (`status === 'completed'`), returns `202` if still processing, `500` if `status === 'failed'`.

---

## 5. AI Training Hub (Deep Dive)

**File:** `backend/src/routes/training.js`  
**Frontend:** `frontend/src/pages/PracticeHub.jsx`, `frontend/src/components/training/`

The Training Hub has **3 distinct sub-features** plus a **Personalized Drill System** fed by interview data.

### Feature 1: STAR Story Builder
A tool for crafting and refining behavioral interview answers using the STAR (Situation, Task, Action, Result) method.

- `GET /api/training/star/questions?domain=<field>`:
  - Fetches 5 domain-specific behavioral questions from OpenAI `gpt-4o-mini`.
  - Merges them with 5 static hardcoded fallback questions.
  - Returns a shuffled array of up to 10 questions.
- `POST /api/training/star`:
  - Accepts a full STAR answer (situation, task, action, result fields).
  - OpenAI polishes it into a fluent 150-200 word interview-ready answer and provides 3 improvement tips.
  - Saves the story to the `star_stories` Supabase table.
- `GET /api/training/star/stories`: Fetches all saved STAR stories for the user.
- `DELETE /api/training/star/stories/:id`: Deletes a specific story.

### Feature 2: Elevator Pitch Trainer
A tool for practising and improving a 60-second professional elevator pitch.

- `POST /api/training/pitch`:
  - Accepts `pitchText` and `domain`.
  - OpenAI evaluates on 3 dimensions (each scored 0-10): **Structure**, **Tone**, **Overall**.
  - Also returns `feedback` (text paragraph) and an `example_pitch` tailored to the candidate's domain.
  - Tracks `attempt_number` per user+domain, saved to `pitch_attempts` table.
- `GET /api/training/pitch/history?domain=<field>`: Fetches all pitch attempts for trend/progress tracking.

### Feature 3: Speaking Drill (Real-Time Coaching)
- `POST /api/training/transcribe`: Accepts an audio file and transcribes it via **OpenAI Whisper-1** (same pipeline as the interview evaluator).
- `POST /api/training/speaking-feedback`:
  - Accepts the transcribed text, the original prompt/question, and the domain.
  - **Filler word detection**: Scans the transcript locally for 11 common filler words (`um`, `uh`, `like`, `you know`, `basically`, etc.).
  - OpenAI then evaluates: `clarity_score`, `confidence_score`, `structure_score`, `filler_count`, `strengths`, `suggestions`, `improved_version`, `overall_feedback`.

### Feature 4: Personalized Practice Drills (AI-Generated)
This system auto-generates targeted exercises based on **real interview performance data**.

- `GET /api/interviews/recommendations`:
  - Fetches the user's last 5 completed interviews from the database.
  - Builds a performance summary across `overallScore`, `communicationScore`, `contentRelevanceScore`.
  - Detects if the user is in a technical field (CS/software/data).
  - OpenAI `gpt-4o-mini` analyzes weaknesses and generates **2 highly targeted exercises**, each of a specific type:
    - `speaking_drill`: Includes a spoken script and step-by-step practice routine.
    - `code_debug`: Includes a real 8-15 line buggy code snippet with a stated bug goal.
    - `story_structure`: Includes 5-6 scrambled STAR bullets to reorder.
    - `analytical_puzzle`: Includes a short case study or logic puzzle.
  - Exercises include: `area_of_focus`, `exercise_type`, `skill_tag`, `difficulty_level` (1-5), `title`, `description`, `scenario`, `steps[]`, `targeted_advice`.
  - Saved to the `practice_sessions` table.
- `PATCH /api/interviews/recommendations/:id/complete`: Marks a practice session as `completed`.
- `GET /api/training/drills`: Fetches practice sessions with optional filters (`domain`, `skill_tag`, `difficulty_level`).
- `GET /api/training/drills/skill-breakdown`: Aggregates practice sessions by `skill_tag` and completion rate (0-100 scale). Used by a radar/spider chart on the frontend.

---

## 6. Dashboard Analytics (Deep Dive)

**Route:** `GET /api/dashboard/stats`  
**File:** `backend/src/routes/dashboard.js`

Returns a comprehensive stats object assembled from multiple Supabase queries:

| Metric | Calculation |
|---|---|
| `totalResumes` | COUNT of rows in `resumes` for the user. |
| `totalInterviews` | COUNT of rows in `interviews` with `status = 'completed'`. |
| `avgAtsScore` | Average `overall_score` across all uploaded resumes (parsed from the JSON blob in `parsed_text`). |
| `practiceTime` | Estimated: `(completed interviews × 20min) + (completed practice sessions × 10min)`. |
| `trainingProgress` | Percentage of `practice_sessions` with `status = 'completed'`. |
| `atsTrend` | Last 4 resume uploads as `[{ name: "Upload N", score: N }]` — used for a line/bar chart. |
| `interviewScores` | From the **latest completed interview**: Communication, Relevance, Overall, Technical (avg of comm + relevance). |
| `growth` | **Weekly delta**: counts of resumes/interviews added in the last 7 days, ATS score delta vs. older average. |

---

## 7. Contact System (Deep Dive)

**Route:** `POST /api/contact`  
**File:** `backend/src/routes/contact.js`

1. Validates `name`, `email`, `message` (required), `protocol` (subject/inquiry type).
2. Saves to `contact_messages` Supabase table using the **service role key** (bypasses RLS for backend write).
3. Sends a styled HTML email notification via **Resend API** to the admin email (`ADMIN_EMAIL` env var). The email template is a full dark-mode branded design matching the app's color scheme (`#C88D8E` pink accents on `#0E1D21` background).

---

## 8. Database Schema (Full Reference)

All tables defined in `supabase_schema.sql`.

### `public.users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | References `auth.users.id`. Auto-populated by trigger. |
| `full_name` | TEXT | Set from `raw_user_meta_data` during signup. |
| `email` | TEXT UNIQUE | |
| `avatar_url` | TEXT | Optional. |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `public.resumes`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `file_name` | TEXT | Original filename. |
| `storage_path` | TEXT | Set to `'local'` (schema workaround; files are not in Supabase Storage). |
| `parsed_text` | TEXT | Stores a JSON blob: `{ extractedText, analysis }`. |
| `created_at` | TIMESTAMPTZ | |

### `public.interviews`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `resume_id` | UUID (FK → resumes, nullable) | |
| `job_role` | TEXT | e.g., "Senior Frontend Developer" |
| `job_field` | TEXT | e.g., "Software Engineering" |
| `difficulty` | TEXT | `easy` / `medium` / `hard` |
| `mode` | TEXT | `voice + video` / `voice only` |
| `questions` | JSONB | Array of 6 question strings. |
| `status` | TEXT | `pending` / `in_progress` / `completed` / `failed` |
| `tavus_conversation_id` | TEXT | The ID of the Tavus conversation. |
| `transcript` | TEXT | Raw Whisper transcription of candidate's audio. |
| `evaluation` | JSONB | `{ overallScore, communicationScore, contentRelevanceScore, strengths, improvements, feedback }` |
| `overall_score` | INTEGER (0-100) | |
| `created_at` / `completed_at` | TIMESTAMPTZ | |

### `public.star_stories`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `domain` | TEXT | |
| `question` | TEXT | The behavioral question answered. |
| `situation` / `task` / `action` / `result` | TEXT | Raw STAR fields. |
| `polished_answer` | TEXT | AI-polished version. |
| `improvement_tips` | TEXT[] | Array of 3 tips. |
| `created_at` | TIMESTAMPTZ | |

### `public.pitch_attempts`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `domain` | TEXT | |
| `pitch_text` | TEXT | Raw pitch submitted. |
| `word_count` | INT | |
| `structure_score` / `tone_score` / `overall_score` | INT (0-10) | |
| `feedback` | TEXT | |
| `example_pitch` | TEXT | AI-generated reference pitch. |
| `attempt_number` | INT | Increments per user+domain. |
| `created_at` | TIMESTAMPTZ | |

### `public.practice_sessions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `area_of_focus` | TEXT | e.g., "Communication Confidence" |
| `exercise_type` | TEXT | `speaking_drill` / `code_debug` / `story_structure` / `analytical_puzzle` / `behavioral` |
| `skill_tag` | TEXT | `communication` / `reasoning` / `domain_knowledge` / `structure` |
| `difficulty_level` | INT (1-5) | |
| `domain` | TEXT | |
| `content` | JSONB | `{ title, description, scenario, steps[], targeted_advice }` |
| `status` | TEXT | `pending` / `completed` |
| `created_at` | TIMESTAMPTZ | |

### `public.ats_reports`
> Legacy table — defined in schema but not actively used by the current application routes. The ATS analysis is stored directly in `resumes.parsed_text` instead.

### `public.contact_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `name` / `email` / `protocol` / `message` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| RLS | Public INSERT | Authenticated SELECT (admins only). |

---

## 9. Row Level Security (RLS) Summary

Every table has RLS enabled. All policies follow the same pattern:
- **Users**: `auth.uid() = id` (SELECT, UPDATE own profile only).
- **All other tables**: `auth.uid() = user_id` (ALL operations — SELECT, INSERT, UPDATE, DELETE).
- **`contact_messages`**: Public INSERT (anyone can submit), authenticated SELECT (admin view).

This means even if an API call were spoofed with a valid token, Supabase would still physically reject any query where the authenticated user's ID doesn't match the `user_id` of the rows being accessed.

---

## 10. User Profile Management

**Route:** `GET /api/users/profile` — Fetches the user's row from `public.users`.  
**Route:** `PUT /api/users/profile` — Upserts `full_name` and `updated_at` for the user.  
**File:** `backend/src/routes/users.js`

The frontend `Profile.jsx` page (45KB+) handles avatar display, name editing, password changes, and account statistics.

---

## 11. Frontend Pages & Components Reference

| Page | Route | Protected | Description |
|---|---|---|---|
| `Home.jsx` | `/` | No | Landing page with hero, features, CTA. |
| `Login.jsx` | `/login` | No | Email/password + Google OAuth sign-in. |
| `SignUp.jsx` | `/signup` | No | Registration with email/password. |
| `ForgotPassword.jsx` | `/forgot-password` | No | Sends password reset email. |
| `ResetPassword.jsx` | `/reset-password` | No | Sets new password after email link. |
| `Services.jsx` | `/services` | No | Feature overview page. |
| `Pricing.jsx` | `/pricing` | No | Pricing tiers page. |
| `About.jsx` | `/about` | No | About page. |
| `Contact.jsx` | `/contact` | No | Contact form (posts to `/api/contact`). |
| `Dashboard.jsx` | `/dashboard` | **Yes** | Main hub: stats, ATS trend chart, interview scores, activity. |
| `ResumeUpload.jsx` | `/resume` | **Yes** | Upload PDF → triggers full ATS pipeline → shows `ResumeAnalysisResult`. |
| `InterviewSession.jsx` | `/interview` | **Yes** | Setup form → Tavus iframe session → triggers evaluation. |
| `InterviewReport.jsx` | `/interview/report/:sessionId` | **Yes** | Polls for and displays the post-interview evaluation. |
| `PracticeHub.jsx` | N/A (via Dashboard) | **Yes** | Contains STAR Builder, Elevator Pitch Trainer, Speaking Drill, and Practice Drills tabs. |
| `Profile.jsx` | `/profile` | **Yes** | User profile management. |
| `AdminPanel.jsx` | `/cc-admin` | **Hidden/Custom** | Self-contained, single-file admin portal with custom client-side auth, analytics, and user management. |

| Component | Description |
|---|---|
| `Navbar.jsx` | Global navigation bar with auth-aware links. |
| `ProtectedRoute.jsx` | Wraps protected routes; redirects to `/login` if `user` is null. |
| `ResumeAnalysisResult.jsx` | Renders the full ATS score breakdown, feedback, and keyword analysis. |
| `Logo.jsx` | SVG logo component (44KB — contains animated inline SVG). |
| `training/STARBuilder.jsx` | Full STAR story creation & history UI. |
| `training/ElevatorPitchTrainer.jsx` | Pitch input, scoring, attempt history chart UI. |

---

## 12. API Routes Summary

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check endpoint. |
| GET | `/api/users/profile` | Yes | Get authenticated user's profile. |
| PUT | `/api/users/profile` | Yes | Update user's profile (full_name). |
| GET | `/api/resumes/latest` | Yes | Get the most recent resume. |
| GET | `/api/resumes/` | Yes | Get full resume upload history. |
| POST | `/api/resumes/upload` | Yes | Upload PDF → ATS + AI analysis + save. |
| POST | `/api/interviews/initialize` | Yes | Generate questions, create Tavus session. |
| POST | `/api/interviews/:conversationId/end` | Yes | End the Tavus conversation. |
| POST | `/api/interviews/:sessionId/evaluate` | Yes | Whisper transcription + GPT evaluation. |
| GET | `/api/interviews/:sessionId/report` | Yes | Poll for completed evaluation. |
| GET | `/api/interviews/recommendations` | Yes | AI-generate personalized practice drills. |
| PATCH | `/api/interviews/recommendations/:id/complete` | Yes | Mark a drill as completed. |
| GET | `/api/dashboard/stats` | Yes | Full analytics payload for Dashboard. |
| GET | `/api/training/star/questions` | No | Get behavioral questions for domain. |
| POST | `/api/training/star` | Yes | Polish a STAR answer + save. |
| GET | `/api/training/star/stories` | Yes | Get all saved STAR stories. |
| DELETE | `/api/training/star/stories/:id` | Yes | Delete a STAR story. |
| POST | `/api/training/pitch` | Yes | Evaluate elevator pitch + save. |
| GET | `/api/training/pitch/history` | Yes | Get pitch attempt history. |
| POST | `/api/training/transcribe` | Yes | Transcribe audio via Whisper. |
| POST | `/api/training/speaking-feedback` | Yes | Evaluate spoken answer transcript. |
| GET | `/api/training/drills` | Yes | Get practice sessions with filters. |
| GET | `/api/training/drills/skill-breakdown` | Yes | Get skill tag completion stats. |
| POST | `/api/contact` | No | Submit contact form + send email. |

---

## 13. Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini and Whisper-1. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (used by contact route for elevated DB access). |
| `SUPABASE_ANON_KEY` | Public anon key (used by the backend Supabase client for auth verification). |
| `TAVUS_API_KEY` | Tavus API key for creating AI video conversations. |
| `RESEND_API_KEY` | Resend API key for sending emails. |
| `ADMIN_EMAIL` | Email address to receive contact form notifications. |
| `PORT` | Server port (default: 5000). |

### Frontend (`frontend/.env.local`)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (client-side). |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (client-side). |
| `VITE_API_URL` | Backend API base URL (e.g., `http://localhost:5000/api`). |

---

## 14. Why This Architecture is Impressive

1. **Hybrid AI + Deterministic System**: The ATS grader combines a custom regex/algorithm engine with GPT-4o-mini. The mathematical score is always objective and reproducible; the AI layer adds personalized, context-aware qualitative feedback on top. Neither alone would be as accurate or useful.

2. **Real AI Video Interviewer (Tavus)**: Instead of text-based chat, CareerCraft uses Tavus to create a photorealistic AI video avatar that speaks, listens, and adapts in real-time. This is a significant leap beyond traditional interview simulators.

3. **Whisper-Powered Evaluation**: The candidate's audio is captured in the browser via `MediaRecorder`, sent as a `webm` blob, transcribed by OpenAI Whisper-1 (one of the best speech-to-text models available), and then evaluated by GPT-4o-mini — creating a fully automated, end-to-end interview scoring pipeline.

4. **Closed-Loop Training System**: Interview performance data directly feeds the Practice Hub. After every interview, the system automatically identifies weak areas and generates targeted, field-specific exercises — creating a continuous improvement loop that gets smarter over time.

5. **Database-Level Security**: RLS policies in Supabase enforce data isolation at the PostgreSQL layer — not just at the application layer — making the system fundamentally more secure than typical JWT-only API architectures.

6. **Graceful Degradation**: Every AI call has a fallback path. If OpenAI fails during resume analysis, the algorithmic scores are still returned. If no audio is recorded during an interview, a zero-score evaluation is saved and the user is still directed to the report page.

7. **Hidden Admin Portal Architecture**: The `/cc-admin` route is completely decoupled from the main application's auth loop and router layout. It acts as a single-page application within the main app, utilizing a separate `adminQueries.js` service to directly fetch aggregated platform analytics.
