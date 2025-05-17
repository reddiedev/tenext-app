import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import axios, { type AxiosResponse } from "axios";
import { env } from "~/env";

export const agentRouter = createTRPCRouter({
	getChatHistory: publicProcedure
		.input(z.object({ sessionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// check if the user has a cookie with the name "access_token"
			const registerResponse = await axios
				.post("/api/auth/register", input)
				.catch(console.error);
			const loginResponse = await axios.post("/api/auth/login", input);
			return { success: true };
		}),

	getChatCompletion: protectedProcedure
		.input(z.object({ sessionId: z.string(), message: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const cookies = ctx.cookies;
			const accessToken = cookies.access_token;
			const chatResponse: AxiosResponse<{
				message: {
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
				session_id: string;
			}> = await axios.post(
				env.NEXT_PUBLIC_BACKEND_URL + "/agent/v1/chat_invoke",
				{
					message: input.message,
					session_id: input.sessionId,
				},
				{
					headers: { Authorization: `Bearer ${accessToken}` },
					withCredentials: true,
				},
			);

			return chatResponse.data;
		}),
});
