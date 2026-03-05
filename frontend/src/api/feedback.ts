import apiClient from './client';

export interface FeedbackPayload {
  message: string;
  category?: string | null;
}

export interface FeedbackResponse {
  status: string;
}

export async function sendFeedback(data: FeedbackPayload): Promise<FeedbackResponse> {
  const response = await apiClient.post<FeedbackResponse>('/feedback', data);
  return response.data;
}

