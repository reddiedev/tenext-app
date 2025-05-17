/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ["next-auth"],
	images: {
		remotePatterns: [
			{
				hostname: "plus.unsplash.com",
			},
			{
				hostname: "lh3.googleusercontent.com",
			},
			{
				hostname: "i.pravatar.cc",
			},
		],
	},

	devIndicators: false
};

export default config;
