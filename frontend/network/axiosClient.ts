import axios from "axios";

declare global {
  interface Window {
    __ENV?: Record<string, string | undefined>;
  }
}

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const HARD_CODED_GATEWAY = "https://api-gateway-j4i3ud5cyq-as.a.run.app";

const readRuntimeEnv = (key: string): string | undefined => {
  if (typeof window !== "undefined" && window.__ENV && typeof window.__ENV[key] === "string") {
    const value = window.__ENV[key];
    if (value) return value;
  }
  const nodeValue = process.env[key as keyof NodeJS.ProcessEnv];
  return typeof nodeValue === "string" ? nodeValue : undefined;
};

const gatewayBaseRaw = readRuntimeEnv("NEXT_PUBLIC_API_GATEWAY_URL");
const fallbackGateway = stripTrailingSlash(HARD_CODED_GATEWAY);
const gatewayBase = gatewayBaseRaw ? stripTrailingSlash(gatewayBaseRaw) : fallbackGateway;

// Default to the Cloud Run gateway when explicit service URLs are absent.
const userBase: string = readRuntimeEnv("NEXT_PUBLIC_USER_API")
  ?? (gatewayBase ? `${gatewayBase}/users` : "http://localhost:3001");

const matchBase: string = readRuntimeEnv("NEXT_PUBLIC_MATCH_API")
  ?? (gatewayBase ? `${gatewayBase}/match` : "http://localhost:3002");

export const userClient = axios.create({
  baseURL: stripTrailingSlash(userBase),
  timeout: 15000,
});

export const matchClient = axios.create({
  baseURL: stripTrailingSlash(matchBase),
  timeout: 15000,
});

// Common interceptors (JWT, request ID)
[userClient, matchClient].forEach(c => {
  c.interceptors.request.use(cfg => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
});