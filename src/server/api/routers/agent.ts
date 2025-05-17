import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import axios, { type AxiosResponse } from "axios";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";
import type {
	ChatCompletionResponse,
	ChatHistoryResponse,
	UIThread,
} from "~/types/chat";

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

			const thread: UIThread = {
				id: input.threadId,
				title: "New Chat",
				userEmail: ctx.session.user.email!,
				messages: [
					{
						id: 1,
						sender: "Path",
						content: "Hello, how may I help you today?",
						avatar: "/logo-blue.png",
						timestamp: new Date().toISOString(),
						isCurrentUser: false,
						role: "assistant",
					},
				],
			};

			return thread;
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
			messages: [
				{
					id: 1,
					sender: "Path",
					content: "Hello, how may I help you today?",
					avatar: "/logo-blue.png",
					timestamp: new Date().toISOString(),
					isCurrentUser: false,
					role: "assistant",
				},
			],
		};

		return newUIThread;
	}),

	// probably not needed anymore
	getChatHistory: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.session.user.accessToken;

			if (!accessToken) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "No access token",
				});
			}

			const chatHistoryResponse: AxiosResponse<ChatHistoryResponse> =
				await axios.post(
					env.NEXT_PUBLIC_BACKEND_URL + "/agent/v1/chat_history",
					{
						session_id: input.sessionId,
					},
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);

			return chatHistoryResponse.data;
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
