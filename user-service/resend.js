import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zlsoqzwmopjffybmxjov.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc29xendtb3BqZmZ5Ym14am92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODI5MTQsImV4cCI6MjA3NDM1ODkxNH0.qwqVDsyV40M-PJlXjPzUbp1KJPQtyqT3eAIEDZdps2E"
);

const { data, error } = await supabase.auth.resend({
  type: "signup",
  email: "elizacajetas@gmail.com",
});

console.log({ data, error });
