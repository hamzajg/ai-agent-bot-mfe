export type StreamCallback = (chunk: string) => void;

/**
 * Reads a fetch response body line-by-line, buffering partial lines across
 * chunk boundaries and flushing a trailing unterminated line at EOF.
 * Works for both NDJSON (Ollama) and SSE (`data: ...`) streams.
 */
export async function readStreamLines(
  body: ReadableStream<Uint8Array>,
  onLine: (line: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last, possibly incomplete, line in the buffer for the next read.
    buffer = lines.pop() ?? '';
    for (const line of lines) onLine(line);
  }

  if (buffer) onLine(buffer);
}

/** Returns the payload of an SSE `data:` line, or null for non-data lines. */
export function sseData(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data: ')) return null;
  return trimmed.slice(6).trim();
}
