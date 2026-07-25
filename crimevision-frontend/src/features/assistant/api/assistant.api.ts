import { apiClient } from "@/shared/lib/api-client";

export interface AssistantQueryContext {
  districtFilter?: string;
}

export interface AssistantQueryResponse {
  answer: string;
}

export const assistantApi = {
  query: (question: string, context?: AssistantQueryContext): Promise<AssistantQueryResponse> =>
    apiClient.post<AssistantQueryResponse>("/assistant/query", { question, context }),
};
