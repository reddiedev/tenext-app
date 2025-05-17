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
		const threads: UIThread[] = [
			{
				id: "1",
				title: "Project Discussion",
				userEmail: "alice@example.com",
				messages: [
					{
						id: 101,
						sender: "Alice",
						avatar: "https://i.pravatar.cc/300?img=5",
						content: "I've pushed the initial designs to the repo",
						timestamp: new Date().toISOString(),
						isCurrentUser: true,
						role: "user",
					},
					{
						id: 102,
						sender: "You",
						content: "Looks great! I'll review them today",
						timestamp: new Date().toISOString(),
						isCurrentUser: false,
						role: "agent",
					},
					{
						id: 103,
						sender: "Bob",
						avatar: "https://i.pravatar.cc/300?img=12",
						content: "Let's finalize the UI components by Friday",
						timestamp: new Date().toISOString(),
						isCurrentUser: true,
						role: "user",
					},
				],
			},
			{
				id: "2",
				title: "API Integration",
				userEmail: "bob@example.com",
				messages: [
					{
						id: 201,
						sender: "You",
						content: "Has anyone tested the login flow?",
						timestamp: new Date(Date.now() - 172800000).toISOString(),
						isCurrentUser: true,
						role: "user",
					},
					{
						id: 202,
						sender: "Charlie",
						avatar: "https://i.pravatar.cc/300?img=30",
						content: "I'm working on it now",
						timestamp: new Date(Date.now() - 86400000).toISOString(),
						isCurrentUser: false,
						role: "user",
					},
					{
						id: 203,
						sender: "Charlie",
						avatar: "https://i.pravatar.cc/300?img=30",
						content: "The authentication endpoint is now working",
						timestamp: new Date(Date.now() - 21600000).toISOString(),
						isCurrentUser: false,
						role: "user",
					},
				],
			},
			{
				id: "3",
				title: "Deployment Planning",
				userEmail: "devops@example.com",
				messages: [
					{
						id: 301,
						sender: "DevOps Team",
						avatar: "https://i.pravatar.cc/300?img=60",
						content: "We need to set up the staging environment",
						timestamp: new Date(Date.now() - 7200000).toISOString(),
						isCurrentUser: false,
						role: "user",
					},
				],
			},
		];

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
				messages: [],
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

		const firstMessage = "Hello, how may I help you today?";

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
					content: firstMessage,
					timestamp: new Date().toISOString(),
					isCurrentUser: true,
					role: "agent",
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
