# CareerCraft AI - Backend

Secure Express backend for the CareerCraft AI platform.

## Features
- Secure API with JWT authentication and Role-Based Access Control via Supabase.
- **AI Interview Engine**: Integrates with Tavus API for real-time video avatars and OpenAI Whisper for audio transcription.
- **Smart ATS Grader**: Deterministic parsing engine merged with GPT-4o-mini qualitative analysis.
- **AI Training Hub**: Endpoints for STAR Story grading, Elevator Pitch evaluation, and AI-generated practice drills.
- **Corporate Contact System**: Resend API integration for automated email dispatch.
- **Local Acoustic NLP Analysis**: Uses Python (`librosa`) to analyze speech rate, tone, and hesitations directly from interview audio.

## Setup
### Prerequisites
- Node.js (v18+)
- Python 3.8+ (Required for acoustic analysis)
- `ffmpeg` (Required on the host machine to process `.webm` audio files)

### Installation
1. Clone the repository.
2. Run `npm install` to install Node dependencies.
3. Run `pip install -r requirements.txt` to install Python NLP dependencies.
4. Create a `.env` file in the `backend` root with the following structure:
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
5. Run `npm start` to start the server.
