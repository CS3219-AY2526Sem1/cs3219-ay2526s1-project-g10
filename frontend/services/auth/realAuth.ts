// Real authentication service using Supabase
import { createClient } from "@supabase/supabase-js"

export interface User {
  id: string
  email: string
  username: string
  role: "user" | "admin"
  email_confirmed_at?: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
      )
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseClient
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  if (!data.user) throw new Error("No user returned")

  // Fetch user profile to get role and username
  const { data: profile, error: profileError } = await supabase
    .from("User")
    .select("username, isAdmin")
    .eq("id", data.user.id)
    .single()

  if (profileError) throw profileError

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      username: profile.username,
      role: profile.isAdmin ? "admin" : "user",
      email_confirmed_at: data.user.email_confirmed_at,
    },
    token: data.session?.access_token || "",
  }
}

export async function signup(username: string, email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) throw error
  if (!data.user) throw new Error("No user returned")

  // Only create profile if email is already verified (verification disabled)
  if (data.user.email_confirmed_at) {
    const { error: profileError } = await supabase.from("User").insert({
      id: data.user.id,
      email: data.user.email,
      username,
      isAdmin: false,
    })

    if (profileError && profileError.code !== "23505") {
      throw profileError
    }
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      username,
      role: "user",
      email_confirmed_at: data.user.email_confirmed_at,
    },
    token: data.session?.access_token || "",
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/user/reset-password`,
  })

  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("User").select("username, isAdmin").eq("id", user.id).single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email!,
    username: profile.username,
    role: profile.isAdmin ? "admin" : "user",
    email_confirmed_at: user.email_confirmed_at,
  }
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}