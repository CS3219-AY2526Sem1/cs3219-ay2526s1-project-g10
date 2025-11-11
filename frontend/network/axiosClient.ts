import axios from "axios"
import { supabase } from "./supabaseClient"
import type { InternalAxiosRequestConfig } from "axios";

// --- Create clients for each backend microservice ---
export const userClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API ?? "http://localhost:3001",
  timeout: 5000,
})

export const matchClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MATCH_API ?? "http://localhost:3002",
  timeout: 5000,
})

// --- Attach Supabase token automatically ---
async function attachToken(cfg: InternalAxiosRequestConfig) {

  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  } catch (err) {
    console.warn("Failed to fetch Supabase session:", err)
  }
  return cfg
}

[userClient, matchClient].forEach((c) => {
  c.interceptors.request.use(attachToken)
})
