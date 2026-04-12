import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khfquetvkwpnkibrgskw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZnF1ZXR2a3dwbmtpYnJnc2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MDA1MjUsImV4cCI6MjA5MTQ3NjUyNX0.OzhDGLIpJjBPfWbENTxLDGBAt3ynZkI3IWR1qga3rvc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);