import axios from "axios";

import { getRuntimeEnv, resolveGatewayBase, stripTrailingSlash } from "../lib/runtimeEnv";

const gatewayBase = resolveGatewayBase();

// Default to the Cloud Run gateway when explicit service URLs are absent.
const userBase: string = getRuntimeEnv("NEXT_PUBLIC_USER_API")
  ?? (gatewayBase ? `${gatewayBase}/users` : "http://localhost:3001");

const matchBase: string = getRuntimeEnv("NEXT_PUBLIC_MATCH_API")
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