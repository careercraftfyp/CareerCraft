import sys
import json
import librosa
import numpy as np

def analyze_audio(file_path):
    try:
        # Load audio file (sr=None preserves original sampling rate)
        y, sr = librosa.load(file_path, sr=None)
        
        # 1. Speech Rate Approximation (Onsets per minute)
        # An onset loosely correlates to a syllable
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
        duration_sec = librosa.get_duration(y=y, sr=sr)
        duration_min = duration_sec / 60.0
        
        # Syllables per minute
        speech_rate = len(onsets) / duration_min if duration_min > 0 else 0
        
        # Categorize speech rate
        if speech_rate < 110:
            rate_category = "Slow"
        elif speech_rate > 170:
            rate_category = "Fast"
        else:
            rate_category = "Optimal"
            
        # 2. Pitch / Intonation Analysis
        # Extract Fundamental Frequency (F0)
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        
        # Filter out unvoiced frames (NaN)
        f0_voiced = f0[~np.isnan(f0)]
        
        if len(f0_voiced) > 0:
            pitch_mean = float(np.mean(f0_voiced))
            pitch_std = float(np.std(f0_voiced))
            
            # High standard deviation means more varied intonation
            # A low std dev means monotone. A rough threshold is 20 Hz
            if pitch_std < 20:
                tone = "Monotone"
            elif pitch_std > 50:
                tone = "Highly Expressive"
            else:
                tone = "Natural and Dynamic"
        else:
            pitch_mean = 0
            pitch_std = 0
            tone = "Unable to determine (Insufficient voiced audio)"

        # 3. Pause / Hesitation Detection
        # Detect non-silent intervals (top_db=30 is threshold below reference to consider silence)
        intervals = librosa.effects.split(y, top_db=30)
        
        pauses_count = 0
        long_pauses = 0
        
        if len(intervals) > 1:
            # interval shape is (n, 2) [start_sample, end_sample]
            for i in range(len(intervals) - 1):
                end_of_current = intervals[i][1]
                start_of_next = intervals[i+1][0]
                
                pause_duration = (start_of_next - end_of_current) / sr
                
                # If pause is > 0.5s it's a pause, > 1.5s is a long pause / hesitation
                if pause_duration > 0.5:
                    pauses_count += 1
                if pause_duration > 1.5:
                    long_pauses += 1
        
        result = {
            "duration_seconds": round(duration_sec, 2),
            "speech_rate_category": rate_category,
            "estimated_syllables_per_minute": round(speech_rate, 1),
            "tone_analysis": tone,
            "pitch_std_dev": round(pitch_std, 2),
            "pauses_detected": pauses_count,
            "long_hesitations": long_pauses,
            "status": "success"
        }
        
    except Exception as e:
        result = {
            "status": "error",
            "error_message": str(e)
        }
        
    # Output JSON string for Node to parse
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error_message": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    analyze_audio(file_path)
