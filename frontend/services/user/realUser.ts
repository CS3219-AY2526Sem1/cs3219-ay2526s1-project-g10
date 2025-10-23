import { createClient } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getUserProfile(userId: string): Promise<UserProfile> {
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
    createdAt: data.created_at || data.createdAt, // Handle both formats
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<UserProfile> {
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
    createdAt: data.created_at || data.createdAt,
  }
}