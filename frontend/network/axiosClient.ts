import axios from "axios";

export const userClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API ?? "http://localhost:3001", 
  timeout: 5000,
});

export const matchClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MATCH_API ?? "http://localhost:3002", 
  timeout: 5000,
});

// Common interceptors (JWT, request ID)
[userClient, matchClient].forEach(c => {
  c.interceptors.request.use(cfg => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
});