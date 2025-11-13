import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const DEFAULT_FRONTEND_BASE = "https://frontend-j4i3ud5cyq-as.a.run.app"

const resolveFrontendBase = () => {
  const explicit = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ?? process.env.FRONTEND_ORIGIN
  const fallback = process.env.NODE_ENV === "production" ? DEFAULT_FRONTEND_BASE : "http://localhost:3000"
  const base = (explicit && explicit.trim().length > 0 ? explicit.trim() : fallback).replace(/\/$/, "")
  return base
}

const redirectUrl = (path: string) => {
  const base = resolveFrontendBase()
  return new URL(path, `${base}/`)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  console.log("code:", code)
  console.log("type:", type)
  console.log("Full request URL:", request.url)

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("Exchange session error:", error)
  return NextResponse.redirect(redirectUrl("/user/login"))
    }

    // Create profile if user exists
    if (data.user) {
      const username = data.user.user_metadata?.username || "User"

      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("id", data.user.id)
        .single()

      const shouldSyncEmail =
        existingUser &&
        data.user.email !== existingUser.email &&
        data.user.email_confirmed_at

      const { error: upsertError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          email: shouldSyncEmail ? data.user.email : existingUser?.email || data.user.email,
          username,
          isAdmin: false,
        })

      if (upsertError) {
        console.error("Upsert user error:", upsertError)
      }

      await supabase.auth.signOut()

      if (type === "email_change" || shouldSyncEmail) {
        return NextResponse.redirect(
          redirectUrl("/user/login?message=Email verified! Please log in with your new email.")
        )
      } else {
        return NextResponse.redirect(
          redirectUrl("/user/login?message=Account verified! Please log in to continue.")
        )
      }
    }
  }

  return NextResponse.redirect(redirectUrl("/user/login"))
}
