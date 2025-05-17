import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import axios from "axios";

export const authRouter = createTRPCRouter({
	register: publicProcedure
		.input(z.object({ email: z.string(), password: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// check if the user has a cookie with the name "access_token"
			const registerResponse = await axios
				.post("/api/auth/register", input)
				.catch(console.error);
			const loginResponse = await axios.post("/api/auth/login", input);
			return { success: true };
		}),
});
