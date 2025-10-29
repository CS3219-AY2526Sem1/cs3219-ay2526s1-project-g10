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
    if (error) {
      console.error("Exchange session error:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Create profile if user exists
    if (data.user) {
      const username = data.user.user_metadata?.username || "User"

      const { error: upsertError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          email: data.user.email,
          username,
          isAdmin: false,
        })

      if (upsertError) {
        console.error("Upsert user error:", upsertError)
      }
    }
  }

  // Redirect to main page
  return NextResponse.redirect(new URL("/main", request.url))
}
