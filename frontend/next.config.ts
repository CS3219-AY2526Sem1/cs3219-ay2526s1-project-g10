import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		// @ts-expect-error runtimeEnv is available in Next.js 15 but not yet part of the type definition
		runtimeEnv: {
			NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
			NEXT_PUBLIC_USER_API: process.env.NEXT_PUBLIC_USER_API,
			NEXT_PUBLIC_MATCH_API: process.env.NEXT_PUBLIC_MATCH_API,
			NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
			NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
			NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
			NEXT_PUBLIC_COLLAB_WS_URL: process.env.NEXT_PUBLIC_COLLAB_WS_URL,
			NEXT_PUBLIC_COLLAB_URL: process.env.NEXT_PUBLIC_COLLAB_URL,
		},
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
