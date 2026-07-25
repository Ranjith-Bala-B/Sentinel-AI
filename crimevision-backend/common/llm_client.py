"""Thin wrapper around the Anthropic API for the two modules that need
real natural-language generation: assistant-service and insights-service.

Design rules enforced here (not just in the prompt):
  - The model is only ever given data this backend already fetched from
    Catalyst Data Store for the current request. It is never given
    open-ended browsing/tool access, and never asked to answer from its
    own world knowledge about specific cases.
  - Every call carries a system prompt that scopes the assistant to
    dashboard analytics only (see SCOPE_SYSTEM_PROMPT) - this is what
    keeps it from turning into a general-purpose chatbot per the
    project brief ("Do NOT create a generic ChatGPT clone").
  - The API key is read from a Catalyst environment variable
    (ANTHROPIC_API_KEY), configured per-environment in the Catalyst
    console - never hardcoded, never sent to the client.
"""
import json
import os
from typing import Any

SCOPE_SYSTEM_PROMPT = (
    "You are the CrimeVision AI dashboard assistant for Karnataka State Police. "
    "You answer ONLY questions about the crime analytics data provided to you in "
    "this request's context. Do not answer general knowledge questions, do not "
    "speculate beyond the given data, and do not discuss anything unrelated to "
    "crime analytics for this platform. If the question cannot be answered from "
    "the provided context, say so plainly and suggest which module of the "
    "platform (Crime Analytics, Hotspot Intelligence, Network Analysis, etc.) "
    "would have that information. Keep answers concise (2-5 sentences) and cite "
    "concrete numbers from the context whenever possible."
)

DEFAULT_MODEL = "claude-sonnet-5"


class LlmError(Exception):
    pass


def _get_api_key() -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise LlmError("ANTHROPIC_API_KEY is not configured for this Catalyst environment")
    return api_key


def generate_text(
    prompt: str,
    context: dict[str, Any],
    system_prompt: str = SCOPE_SYSTEM_PROMPT,
    model: str = DEFAULT_MODEL,
    max_tokens: int = 512,
) -> str:
    """Calls the Anthropic Messages API with the scoped system prompt and
    a data-grounded user message. Returns the model's text response.

    Raises LlmError on any failure so callers can fall back to a
    deterministic, non-LLM response rather than surfacing a raw
    exception to the frontend.
    """
    try:
        import anthropic
    except ImportError as exc:
        raise LlmError("anthropic package not installed - add it to requirements.txt") from exc

    client = anthropic.Anthropic(api_key=_get_api_key())

    user_message = (
        f"Dashboard context (JSON):\n{json.dumps(context, default=str)}\n\n"
        f"Question: {prompt}"
    )

    try:
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
    except Exception as exc:  # network/auth/rate-limit errors from the SDK
        raise LlmError(f"LLM request failed: {exc}") from exc

    text_blocks = [block.text for block in response.content if getattr(block, "type", None) == "text"]
    if not text_blocks:
        raise LlmError("LLM returned no text content")
    return "\n".join(text_blocks).strip()
