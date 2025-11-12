import axios from "axios";

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const gatewayBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL
  ? stripTrailingSlash(process.env.NEXT_PUBLIC_API_GATEWAY_URL)
  : undefined;

// Default to the Cloud Run gateway when explicit service URLs are absent.
const userBase: string = process.env.NEXT_PUBLIC_USER_API
  ?? (gatewayBase ? `${gatewayBase}/users` : "http://localhost:3001");

const matchBase: string = process.env.NEXT_PUBLIC_MATCH_API
  ?? (gatewayBase ? `${gatewayBase}/match` : "http://localhost:3002");

export const userClient = axios.create({
  baseURL: stripTrailingSlash(userBase),
  timeout: 5000,
});

export const matchClient = axios.create({
  baseURL: stripTrailingSlash(matchBase),
  timeout: 5000,
});

// Common interceptors (JWT, request ID)
[userClient, matchClient].forEach(c => {
  c.interceptors.request.use(cfg => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
});