import 'dotenv/config';
import fs from 'fs';
import FormData from 'form-data';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testEvaluate() {
  // 1. Get a recent session
  const { data, error } = await supabase.from('interviews').select('id').order('created_at', { ascending: false }).limit(1);
  if (error || !data || data.length === 0) {
      console.error('Failed to get session from DB', error);
      return;
  }
  const sessionId = data[0].id;
  
  // Create a dummy audio file
  fs.writeFileSync('dummy.webm', 'dummy audio content data format for test');
  
  const form = new FormData();
  form.append('audio', fs.createReadStream('dummy.webm'));

  console.log(`Sending mock audio to evaluate for session: ${sessionId}`);
  
  const res = await fetch(`http://localhost:5000/api/interviews/${sessionId}/evaluate`, {
    method: 'POST',
    body: form,
    headers: {
        'Authorization': 'Bearer testuser' 
    }
  });

  const text = await res.text();
  console.log("Response status:", res.status);
  console.log("Response body:", text);
}

testEvaluate();
