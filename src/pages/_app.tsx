import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import SiteHead from "~/components/site-head";
import { api } from "~/utils/api";
import "~/styles/globals.css";

const geist = Geist({
	subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			<SiteHead />
			<div className={geist.className}>
				<Component {...pageProps} />
				<Toaster />
			</div>
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);
