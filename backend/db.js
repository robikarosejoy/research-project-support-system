const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres.ypregjmvtjfqtqfolefy:piresearch@2024@aws-1-ap-south-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;