export type Message = {
	id: number;
	sender: string;
	avatar?: string;
	content: string;
	timestamp: string;
	isCurrentUser: boolean;
};

export type Thread = {
	id: number;
	name: string;
	avatar: string;
	lastMessage: string;
	unread: number;
	messages: Message[];
};
