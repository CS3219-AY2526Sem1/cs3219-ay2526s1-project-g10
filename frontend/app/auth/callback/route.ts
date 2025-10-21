import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Create profile if this is after email verification
    if (data.user) {
      const username = data.user.user_metadata?.username || "User"

      // Create profile in database
      await supabase.from("User").upsert({
        id: data.user.id,
        email: data.user.email,
        username,
        isAdmin: false,
      })
    }
  }

  // Redirect to matching page after successful verification
  return NextResponse.redirect(new URL("/main", request.url))
}