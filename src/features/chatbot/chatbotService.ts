import { apiClient } from '../../lib/api-client';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ChatbotRequest {
  message: string;
  userId?: string;
}

export interface ChatbotResponse {
  reply: string;
  remainingUses?: number;
  totalLimit?: number;
}

export const chatbotService = {
  sendMessage: async (message: string, userId?: string): Promise<ChatbotResponse> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await apiClient.post<ChatbotResponse>(
      '/chatbot/message',
      { message, userId } satisfies ChatbotRequest,
      { headers },
    );
    return response.data;
  },

  getUsage: async (userId: string) => {
    const response = await apiClient.get('/chatbot/usage', {
      params: { userId },
      headers: { 'X-User-Id': userId },
    });
    return response.data;
  },
};
