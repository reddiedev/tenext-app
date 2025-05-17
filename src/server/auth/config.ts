import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: UserRole;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}

	/* 	interface User {
		role: UserRole;
	} */
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
	],
	adapter: PrismaAdapter(db),
	callbacks: {
		session: ({ session, user }) => {
			return {
				...session,
				user: {
					...session.user,
					id: user.id,
					role: session.user.role,
				},
			};
		},
		signIn: ({ user }) => {
			console.log("signIn:", user);
			return true;
		},
	},
	trustHost: true,
} satisfies NextAuthConfig;
