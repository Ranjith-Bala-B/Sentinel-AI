import { useMutation } from "@tanstack/react-query";
import { assistantApi, type AssistantQueryContext } from "@/features/assistant/api/assistant.api";

export function useAssistantQuery() {
  return useMutation({
    mutationFn: ({ question, context }: { question: string; context?: AssistantQueryContext }) =>
      assistantApi.query(question, context),
  });
}
