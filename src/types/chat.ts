export type UIMessage = {
	id: number;
	sender: string;
	senderEmail: string;
	avatar?: string;
	content: string;
	role: "csr" | "customer";
	timestamp: string;
	isCurrentUser: boolean;
};

export type UIThread = {
	id: string;
	title: string;
	isManualIntervention: boolean;
	userEmail: string;
	messages: UIMessage[];
};

export type ChatHistoryMessage = {
	id: number;
	session_id: string;
	role: string;
	message: string;
	created_at: string;
	updated_at: string;
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
