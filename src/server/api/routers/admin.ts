import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
	changeSystemPrompt: protectedProcedure
		.input(z.object({ systemPrompt: z.string() }))
		.mutation(async ({ ctx, input }) => {
			console.log("modifying system prompt...");

			setTimeout(() => {
				console.log("system prompt modified!");
			}, 1000);

			return { success: true };
		}),
	getStaffUsers: protectedProcedure.query(async ({ ctx }) => {
		const users = await ctx.db.user.findMany({
			where: { role: "user" },
		});
		return users;
	}),
	getAdminUsers: protectedProcedure.query(async ({ ctx }) => {
		const users = await ctx.db.user.findMany({
			where: { role: "admin" },
		});
		return users;
	}),
});
