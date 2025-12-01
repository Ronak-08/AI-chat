import { appState } from './appState.svelte.js';

export async function sendMessage(userMessage) {
  if (!appState.currentSession) return;

  appState.isLoading = true;
  appState.addMessage('user', userMessage);
  appState.addMessage('assistant', '');

  const { provider, keys, model } = appState.settings;
  const rawMessages = appState.currentSession.messages.slice(0, -1);

  const MAX_HISTORY = 10; 
  const messages = rawMessages.slice(-MAX_HISTORY);
  const apiKey = keys[provider] || '';

  try {
    if (provider === 'gemini') {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");

      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model: model });

      const geminiHistory = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const result = await genModel.generateContentStream({ contents: geminiHistory });

      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        appState.updateLastMessage(fullText);
      }

    } 
    else {
      const endpoints = {
        pollinations: 'https://text.pollinations.ai/openai',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        cerebras: 'https://api.cerebras.ai/v1/chat/completions',
        sambanova: 'https://api.sambanova.ai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions'
      };

      const headers = { 'Content-Type': 'application/json' };
      if (provider !== 'pollinations') headers['Authorization'] = `Bearer ${apiKey}`;

      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'http://localhost:5173';
        headers['X-Title'] = 'Minimal AI';
      }

      const payload = {
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true
      };

      const res = await fetch(endpoints[provider], {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || res.statusText);
      }

      await readOpenAIStream(res);
    }

  } catch (error) {
    appState.updateLastMessage(`**Error:** ${error.message}`);
    console.error(error);
  } finally {
    appState.isLoading = false;
  }
}

async function readOpenAIStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulatedText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (let line of lines) {
      line = line.trim();
      if (!line.startsWith("data:")) continue;
      if (line === "data: [DONE]") continue;

      const jsonString = line.slice(6);

      try {
        const json = JSON.parse(jsonString);
        const delta = json.choices?.[0]?.delta?.content || "";

        if (delta) {
          accumulatedText += delta;
          appState.updateLastMessage(accumulatedText);
        }
      } catch (err) {
        console.error("Stream parse error:", err);
      }
    }
  }
}
