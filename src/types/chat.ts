export type UIMessage = {
	id: number;
	sender: string;
	avatar?: string;
	content: string;
	role:
		| "csr"
		| "customer"
		| "assistant"
		| "rate_agent"
		| "solution_agent"
		| "suggest_agent";
	timestamp: string;
	isCurrentUser: boolean;
};

export type UIThread = {
	id: string;
	title: string;
	userEmail: string;
	messages: UIMessage[];
};

export type ChatHistoryResponse = {
	history: ChatMessage[];
	session_id: string;
};

export type ChatMessage = {
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

export type ChatCompletionResponse = {
	message: ChatMessage;
	session_id: string;
};
