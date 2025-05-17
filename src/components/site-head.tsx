import Head from "next/head";

const bannerImageLink =
	"https://images.unsplash.com/photo-1553775282-20af80779df7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const canonicalUrl = "https://path.example.com/";

export const SITE_TITLE = "Path - Empathy Delivered";
export const SITE_DESCRIPTION =
	"Path is the AI-powered SaaS platform redefining customer service by making empathy measurable, actionable, and scalable. Designed for modern CSR teams, Path analyzes every interaction in real time, guiding agents to respond with genuine understanding and care. With Path, empathy isn&apos;t just encouraged—it&apos;s ensured. Elevate your customer experience and build lasting trust, one conversation at a time.";

export default function SiteHead() {
	return (
		<Head>
			<title>{SITE_TITLE}</title>
			<meta name="description" content={SITE_DESCRIPTION} />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1, shrink-to-fit=no"
			/>
			{/* Primary Meta Tags */}
			<meta name="title" content={SITE_TITLE} />
			<meta
				name="keywords"
				content="AI, assistant, chatbot, productivity, natural language, conversation"
			/>
			<meta name="author" content="Path" />
			{/* Open Graph / Facebook */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:title" content={SITE_TITLE} />
			<meta property="og:description" content={SITE_DESCRIPTION} />
			<meta property="og:image" content={bannerImageLink} />{" "}
			{/* Will be added later */}
			{/* Twitter */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={canonicalUrl} />
			<meta property="twitter:title" content={SITE_TITLE} />
			<meta property="twitter:description" content={SITE_DESCRIPTION} />
			<meta property="twitter:image" content={bannerImageLink} />{" "}
			{/* Will be added later */}
			{/* Favicon */}
			<link rel="icon" href="/favicon.ico" />
			<link
				rel="icon"
				type="image/png"
				sizes="32x32"
				href="/favicon-32x32.png"
			/>
			<link
				rel="icon"
				type="image/png"
				sizes="16x16"
				href="/favicon-16x16.png"
			/>
			{/* Apple Touch Icon */}
			<link
				rel="apple-touch-icon"
				sizes="180x180"
				href="/apple-touch-icon.png"
			/>
			{/* Web App Manifest */}
			<link rel="manifest" href="/site.webmanifest" />
			{/* Theme Colors */}
			<meta name="theme-color" content="#ffffff" />
			<meta name="msapplication-TileColor" content="#ffffff" />
			{/* Canonical URL */}
			<link rel="canonical" href={canonicalUrl} />
		</Head>
	);
}
