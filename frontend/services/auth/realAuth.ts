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

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  if (!data.user || !data.session) throw new Error("Login failed")

  const { data: profile, error: profileError } = await supabaseClient
    .from("users")
    .select("username, isAdmin")
    .eq("id", data.user.id)
    .single()

  if (profileError || !profile) {
    throw new Error("User profile not found. Please contact support.")
  }

  if (!data.user.email_confirmed_at) {
    throw new Error("Please verify your email before logging in.")
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      username: profile.username,
      role: profile.isAdmin ? "admin" : "user",
      email_confirmed_at: data.user.email_confirmed_at,
    },
    token: data.session.access_token,
  }
}

export async function signup(username: string, email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error("No user returned")

  const { error: profileError } = await supabaseClient.from("users").insert({
    id: data.user.id,
    email: data.user.email,
    username,
    isAdmin: false,
  })

  if (profileError && profileError.code !== "23505") {
    throw profileError
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
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/user/reset-password`,
  })

  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabaseClient.from("users").select("username, isAdmin").eq("id", user.id).single()

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
  const { error } = await supabaseClient.auth.signOut()
  if (error) throw error
}