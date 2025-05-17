import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import axios, { type AxiosResponse } from "axios";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";
import type {
	ChatCompletionResponse,
	ChatHistoryMessage,
	UIMessage,
	UIThread,
} from "~/types/chat";
import dayjs from "dayjs";

export const agentRouter = createTRPCRouter({
	// CUSTOMER VIEW:
	// /chats page -> get the user's recent threads/sessions

	getRecentThreads: protectedProcedure.query(async ({ ctx }) => {
		const accessToken = ctx.session.user.accessToken;

		if (!accessToken) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "No access token",
			});
		}

		// TODO: get threads from BE
		const threads: UIThread[] = [];

		return threads;
	}),

	// CUSTOMER/STAFF VIEW
	// given threadId aka session_id, get the previous messages (called when opening page)

	getThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.query(async ({ ctx, input }) => {
			const accessToken = ctx.session.user.accessToken;

			if (!accessToken) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "No access token",
				});
			}

			const thread = await ctx.db.thread.findUnique({
				where: {
					cuid: input.threadId,
				},
				include: {
					messages: {
						include: { user: true },
					},
				},
			});

			const historyResponse: AxiosResponse<{ history: ChatHistoryMessage[] }> =
				await axios.get(
					env.NEXT_PUBLIC_BACKEND_URL + "/conversation/get_history",
					{
						params: {
							session_id: input.threadId,
						},
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);

			const formattedMessages = [];

			for (const msg of historyResponse.data.history) {
				const msgData = thread?.messages.find((m) => m.id == msg.id);

				if (!msgData) {
					continue;
				}

				const formattedMessage: UIMessage = {
					id: msg.id,
					sender: msgData.user.name ?? "",
					senderEmail: msgData.user.email ?? "",
					content: msg.message,
					timestamp: dayjs(msg.created_at).toISOString(),
					role: msg.role as UIMessage["role"],
					isCurrentUser: msgData.user.id == ctx.session.user.id,
				};

				formattedMessages.push(formattedMessage);
			}

			// TODO: get the thread from the database
			const UIThread: UIThread = {
				id: input.threadId,
				title: thread?.title ?? "New Chat",
				userEmail: ctx.session.user.email!,
				isManualIntervention: thread?.isManualIntevention ?? false,
				messages: [...formattedMessages],
			};

			return UIThread;
		}),
	// STAFF VIEW
	interveneWithThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.session.user.accessToken;

			if (!accessToken) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "No access token",
				});
			}

			if (ctx.session.user.role == "user") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User cannot intervene with a thread",
				});
			}

			// TODO: intervene with the thread
			await ctx.db.thread.update({
				where: {
					cuid: input.threadId,
				},
				data: {
					isManualIntevention: true,
				},
			});

			return {
				success: true,
			};
		}),

	// USER/STAFF VIEW
	// WHEN THREAD IS MANUAL INTERVENTION, GET THE MESSAGES FROM STAFF/USER
	getThreadMessages: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.query(async ({ ctx, input }) => {
			const accessToken = ctx.session.user.accessToken;

			if (!accessToken) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "No access token",
				});
			}

			// TODO
			const messages: UIMessage[] = [];

			return messages;
		}),

	// USER VIEW
	// create new thread from /chats page

	createNewThread: protectedProcedure.mutation(async ({ ctx }) => {
		const accessToken = ctx.session.user.accessToken;

		if (!accessToken) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "No access token",
			});
		}

		const newThread = await ctx.db.thread.create({
			data: {
				userId: ctx.session.user.id,
			},
		});

		const newUIThread: UIThread = {
			id: newThread.cuid,
			title: "New Chat",
			userEmail: ctx.session.user.email!,
			isManualIntervention: false,

			messages: [],
		};

		return newUIThread;
	}),

	saveThreadMessage: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				message: z.string(),
				role: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.session.user.accessToken;

			if (!accessToken) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "No access token",
				});
			}

			const saveMessageResponse: AxiosResponse<{ message_id: number }> =
				await axios.post(
					env.NEXT_PUBLIC_BACKEND_URL + "/conversation/send_message",
					{
						session_id: input.sessionId,
						role: input.role,
						message: input.message,
					},
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);

			await ctx.db.message.create({
				data: {
					userId: ctx.session.user.id,
					threadId: input.sessionId,
					content: input.message,
					role: input.role,
					id: saveMessageResponse.data.message_id,
				},
			});

			return { message: "ok!" };
		}),

	// probably not needed anymore
	getChatCompletion: protectedProcedure
		.input(z.object({ sessionId: z.string(), message: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.session.user.accessToken;

			if (!accessToken) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "No access token",
				});
			}

			const chatResponse: AxiosResponse<ChatCompletionResponse> =
				await axios.post(
					env.NEXT_PUBLIC_BACKEND_URL + "/agent/v1/chat_invoke",
					{
						message: input.message,
						session_id: input.sessionId,
					},
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);

			return chatResponse.data;
		}),
});
