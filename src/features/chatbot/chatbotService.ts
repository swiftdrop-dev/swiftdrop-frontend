import { apiClient } from '../../lib/api-client';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ChatbotRequest {
  message: string;
}

export interface ChatbotResponse {
  reply: string;
}

export const chatbotService = {
  sendMessage: async (message: string): Promise<ChatbotResponse> => {
    const token = localStorage.getItem('token');
    const response = await apiClient.post<ChatbotResponse>(
      '/chatbot/message',
      { message } satisfies ChatbotRequest,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return response.data;
  },
};
