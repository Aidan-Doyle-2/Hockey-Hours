import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cffvvpjlezgfyifcxwcn.supabase.co";       // from Supabase dashboard
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZnZ2cGpsZXpnZnlpZmN4d2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDAxNDksImV4cCI6MjA3MjQ3NjE0OX0.xEIIbXGCmO5QAs0xcCJnfFT5ZhV3gl8oMIncf5GKABE";  // from Supabase dashboard

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);