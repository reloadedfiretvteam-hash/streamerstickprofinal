import postgres from 'postgres';

// Parse the database URL, removing any wrapping quotes
let dbUrl = process.env.SUPABASE_DATABASE_URL || '';
dbUrl = dbUrl.replace(/^["']|["']$/g, ''); // Remove leading/trailing quotes

if (!dbUrl) {
  console.error('Missing SUPABASE_DATABASE_URL');
  process.exit(1);
}

console.log('Connecting to database...');
console.log('URL prefix:', dbUrl.substring(0, 40) + '...');

const sql = postgres(dbUrl, {
  ssl: 'require',
  max: 1,
  connect_timeout: 30
});

async function addAmountColumn() {
  try {
    console.log('Adding amount column to orders table...');
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0`;
    console.log('Successfully added amount column!');
    
    // Update any NULL values
    await sql`UPDATE orders SET amount = 0 WHERE amount IS NULL`;
    console.log('Updated NULL values to 0');
    
    // Verify the column exists
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'amount'
    `;
    console.log('Column check:', result);
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await sql.end();
  }
}

addAmountColumn();
