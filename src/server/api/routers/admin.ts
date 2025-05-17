import { z } from "zod";
import axios, { type AxiosResponse } from "axios";
import { env } from "~/env";
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

	getUserThreads: protectedProcedure.query(async ({ ctx }) => {
		const threadIds: AxiosResponse<{ sessions: string[] }> = await axios.get(
			env.NEXT_PUBLIC_BACKEND_URL + "/conversation/get_all_sessions",
			{
				headers: {
					Authorization: `Bearer ${ctx.session.user.accessToken}`,
				},
			},
		);

		const threads = [];

		for (const threadId of threadIds.data.sessions) {
			const thread = await ctx.db.thread.findUnique({
				where: {
					cuid: threadId,
				},
				include: { user: true, messages: true },
			});

			if (!thread) {
				continue;
			}

			threads.push(thread);
		}

		const sortedThreads = threads.sort((a, b) => {
			return b.createdAt.getTime() - a.createdAt.getTime();
		});

		return sortedThreads;
	}),
});
