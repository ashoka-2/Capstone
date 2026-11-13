/**
 * Service for streaming AI agent responses via Server-Sent Events (SSE).
 * Calls POST /api/ai/invoke with { projectId, message }
 */

export async function invokeAIAgent({
  projectId,
  message,
  onLog,
  onChunk,
  onDone,
  onError,
  signal,
}) {
  try {
    const response = await fetch('/api/ai/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        message,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `AI invocation failed with HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split SSE packets by double newline
      const packets = buffer.split('\n\n');
      buffer = packets.pop() || ''; // Keep incomplete packet in buffer

      for (const packet of packets) {
        const trimmed = packet.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') {
          continue;
        }

        try {
          const parsed = JSON.parse(dataStr);

          // If chunk is a string from writer?.(...)
          if (typeof parsed === 'string') {
            const lower = parsed.toLowerCase();
            const isLog =
              lower.includes('listing files') ||
              lower.includes('files listed') ||
              lower.includes('reading files') ||
              lower.includes('files read') ||
              lower.includes('updating') ||
              lower.includes('creating files') ||
              lower.includes('files updated') ||
              lower.startsWith('analyzed ') ||
              lower.startsWith('edited ');

            if (isLog) {
              onLog?.(parsed.trim());
            } else {
              accumulatedText += parsed;
              onChunk?.(parsed);
            }
          } else if (typeof parsed === 'object' && parsed !== null) {
            // LangChain chunk formats
            if (parsed.content) {
              const text = typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content);
              accumulatedText += text;
              onChunk?.(text);
            } else if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk?.(parsed.text);
            } else if (parsed.log || parsed.message) {
              onLog?.(parsed.log || parsed.message);
            }
          }
        } catch {
          // If not valid JSON, treat as raw text
          accumulatedText += dataStr;
          onChunk?.(dataStr);
        }
      }
    }

    onDone?.(accumulatedText);
    return accumulatedText;
  } catch (error) {
    if (error.name === 'AbortError') {
      onDone?.('Operation was canceled.');
      return;
    }
    onError?.(error.message || 'Error communicating with AI agent');
    throw error;
  }
}

