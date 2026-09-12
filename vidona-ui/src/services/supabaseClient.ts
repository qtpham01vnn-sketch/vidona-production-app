import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sginwopzjndlweuufjcl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaW53b3B6am5kbHdldXVmamNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjEwNTEsImV4cCI6MjEwNDc5NzA1MX0.ITL-90yKRsuUjak1pSlZ6E0PI7NPrb0S4cqX3OFqqKw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
