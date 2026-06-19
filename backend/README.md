# CareerCraft AI - Backend

Secure Express backend for the CareerCraft AI platform.

## Features
- Secure Admin API with JWT authentication.
- Supabase integration with Service Role bypassing for administrative tasks.
- AI Interview evaluation and ATS report generation.
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
4. Create a `.env` file based on the environment requirements.
5. Run `npm run start` to start the server.
