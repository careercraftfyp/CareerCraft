import pg from 'pg';

const connectionString = 'postgres://postgres.xmcjocfazadjugkirmcl:r4awT21YDpx0taaQ@db.xmcjocfazadjugkirmcl.supabase.co:5432/postgres';

async function main() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres!');
    
    await client.query(`
      ALTER TABLE public.resumes 
      ADD COLUMN IF NOT EXISTS analysis JSONB,
      ADD COLUMN IF NOT EXISTS full_text TEXT;
    `);
    console.log('Successfully added columns (analysis, full_text) to public.resumes');
    
    // Also let's push the user's mock data temporarily so they can see the graph immediately
    // Wait, the router will just save it when they upload next anyway.
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
