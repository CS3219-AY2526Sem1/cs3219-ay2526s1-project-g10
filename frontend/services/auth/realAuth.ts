// Real authentication service using Supabase
import { createBrowserClient } from "@supabase/ssr"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
}

export interface AuthResponse {
  user: User
  token: string
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
      )
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
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

  // Fetch user profile to get role and name
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", data.user.id)
    .single()

  if (profileError) throw profileError

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile.name,
      role: profile.role,
    },
    token: data.session?.access_token || "",
  }
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) throw error
  if (!data.user) throw new Error("No user returned")

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    email: data.user.email,
    name,
    role: "user",
  })

  if (profileError) throw profileError

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      name,
      role: "user",
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

  const { data: profile } = await supabase.from("profiles").select("name, role").eq("id", user.id).single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email!,
    name: profile.name,
    role: profile.role,
  }
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
