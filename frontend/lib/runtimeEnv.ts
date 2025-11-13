const HARD_CODED_GATEWAY = "https://api-gateway-j4i3ud5cyq-as.a.run.app";

const stripTrailingSlashInternal = (url: string): string => url.replace(/\/+$/, "");

declare global {
  interface Window {
    __ENV?: Record<string, string | undefined>;
  }
}

export const stripTrailingSlash = (url: string): string => stripTrailingSlashInternal(url);

export const getRuntimeEnv = (key: string, fallback?: string): string | undefined => {
  if (typeof window !== "undefined" && window.__ENV) {
    const value = window.__ENV[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  const nodeValue = process.env[key as keyof NodeJS.ProcessEnv];
  if (typeof nodeValue === "string" && nodeValue.length > 0) {
    return nodeValue;
  }

  return fallback;
};

export const resolveGatewayBase = (): string => {
  const base = getRuntimeEnv("NEXT_PUBLIC_API_GATEWAY_URL", HARD_CODED_GATEWAY);
  return stripTrailingSlashInternal(base ?? HARD_CODED_GATEWAY);
};

export { HARD_CODED_GATEWAY };
