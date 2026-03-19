import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envStr.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables", supabaseUrl, supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Fetching users...");
  const { data: users, error: errorUsers } = await supabase.from('users').select('*').limit(1);
  if (errorUsers) {
    console.error("Error reading users:", errorUsers);
  } else if (users && users.length > 0) {
    console.log("Users columns:", Object.keys(users[0]));
  } else {
    console.log("Users table empty or blocked by RLS.");
  }

  console.log("Fetching companies...");
  const { data: companies, error: errorCompanies } = await supabase.from('companies').select('*').limit(1);
  if (errorCompanies) {
    console.error("Error reading companies:", errorCompanies);
  } else if (companies && companies.length > 0) {
    console.log("Companies columns:", Object.keys(companies[0]));
  } else {
    console.log("Companies table empty or blocked by RLS.");
  }
}

checkSchema();
