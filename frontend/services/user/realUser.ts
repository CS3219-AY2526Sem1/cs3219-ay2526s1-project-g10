import { createClient } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zlsoqzwmopjffybmxjov.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc29xendtb3BqZmZ5Ym14am92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODI5MTQsImV4cCI6MjA3NDM1ODkxNH0.qwqVDsyV40M-PJlXjPzUbp1KJPQtyqT3eAIEDZdps2E"

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Supabase error:", error)
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    isAdmin: data.isAdmin,
    createdAt: data.createdAt,
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<UserProfile> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Supabase error:", error)
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    isAdmin: data.isAdmin,
    createdAt: data.createdAt,
  }
}