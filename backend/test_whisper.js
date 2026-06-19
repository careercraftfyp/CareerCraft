import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function test() {
    fs.writeFileSync('test_audio', 'RIFF....WAVE'); 
    try {
        await openai.audio.transcriptions.create({
            file: fs.createReadStream('test_audio'),
            model: 'whisper-1'
        });
        console.log('Success without extension');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
test();
