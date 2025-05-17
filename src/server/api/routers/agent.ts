import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import axios, { type AxiosResponse } from "axios";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

type ChatHistoryResponse = {
	history: ChatMessage[];
	session_id: string;
};

type ChatMessage = {
	content: string;
	type: string;
	id: string;
	additional_kwargs: {
		refusal: null | string;
	};
	token_usage: {
		completion_tokens: number;
		prompt_tokens: number;
		total_tokens: number;
		completion_tokens_details: {
			accepted_prediction_tokens: number;
			audio_tokens: number;
			reasoning_tokens: number;
			rejected_prediction_tokens: number;
		};
		prompt_tokens_details: {
			audio_tokens: number;
			cached_tokens: number;
		};
	};
	model_name: string;
};

type ChatCompletionResponse = {
	message: ChatMessage;
	session_id: string;
};

export const agentRouter = createTRPCRouter({
	getChatHistory: publicProcedure
		.input(z.object({ sessionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.cookies.access_token;

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

	getChatCompletion: protectedProcedure
		.input(z.object({ sessionId: z.string(), message: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.cookies.access_token;

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
