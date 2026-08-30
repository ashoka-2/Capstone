export const aiService = {
  async invokeAgent({ message, projectId }, onChunk, onToolActivity) {
    const response = await fetch("/api/ai/invoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, projectId }),
    });

    if (!response.ok) {
      throw new Error(`AI Agent request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      if (chunk.includes("Listing files") || chunk.includes("Files listed")) {
        onToolActivity?.("Browsing workspace files...");
      } else if (chunk.includes("Reading files") || chunk.includes("Files read")) {
        onToolActivity?.("Inspecting file contents...");
      } else if (chunk.includes("Updating files") || chunk.includes("Files updated")) {
        onToolActivity?.("Writing updated code to files...");
      } else if (chunk.includes("Deleting files") || chunk.includes("Files deleted")) {
        onToolActivity?.("Deleting obsolete files...");
      }

      accumulatedText += chunk;
      onChunk?.(accumulatedText);
    }

    return accumulatedText;
  },
};
