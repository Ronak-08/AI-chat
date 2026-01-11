import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import * as db from '$lib/db';
import { sendMessage } from './ai';

class AppState {
  settings = $state({
    provider: 'huggingface',
    keys: {},
    model: {
      huggingface: "openai/gpt-oss-120b:fastest",
      groq : "openai/gpt-oss-120b",
      gemini: "gemini-3-flash-preview",
      cerebras: "llama-3.3-70b",
      sambanova: "DeepSeek-V3.1",
      openrouter: "google/gemma-3-27b-it:free",
    },
    systemPrompt: 'You are a helpful AI assistant.'
  });

  sessions = $state([]);
  currentSessionId = $state(null);
  isLoading = $state(false);
  isSettingsOpen = $state(false);
  isInitialized = $state(false);
  isTemporary = $state(false);

  constructor() {
    if (browser) {
      this.init();
    }
  }

  async init() {
    try {
      const savedSettings = await db.get('settings', 'config');
      if(savedSettings) {
        this.settings = {...this.settings, ...savedSettings };
      }
      const savedSessions = await db.getAll('sessions');
      this.sessions = savedSessions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      const lastId = await db.get('settings', 'lastSessionId')
      if (this.sessions.length === 0) {
        await this.createNewSession();
      } else if(lastId && this.sessions.find(s => s.id === lastId)) {
        this.currentSessionId = lastId;
      } else {
        this.currentSessionId = this.sessions[0].id;
      }

    } catch (error) {
      console.error("DB init error", error);
    } finally {
      this.isInitialized = true;
    }
  }

  async saveSettings() {
    await db.put('settings', $state.snapshot(this.settings), 'config');
  }

  async saveCurrentSession() {
    if(this.currentSession) {
      await db.put('sessions', $state.snapshot(this.currentSession));
      await db.put('settings', this.currentSessionId, 'lastSessionId')
    }
  }

  async generateTitle(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if(!session) return;

   const firstUserMsg = session.messages.find(m => m.role === "user")?.content;
    if(!firstUserMsg) return;

    const messages = [
      { 
        role: 'system', 
        content: 'You are a helpful assistant. Generate a concise, 3-5 word title for this chat based on the user\'s message. Do not use quotes. Do not say "Title:". Just the words.' 
      },
      { role: 'user', content: firstUserMsg }
    ];

    try {
      const title = await this._fetchSilentCompletion(messages);
      session.title = title.trim().replace(/^["']|["']$/g, '');
      if(!this.isTemporary) {
        this.saveCurrentSession();
      }
      
    } catch (error) {
      console.error("Failed to generate title:", error);
    }

  }

  async _fetchSilentCompletion(messages) {
    const provider = this.settings.provider;
    const key = this.settings.keys[provider];
    const model = this.settings.model[provider];

    const endpoints = {
      huggingface: 'https://router.huggingface.co/v1/chat/completions',
      groq: 'https://api.groq.com/openai/v1/chat/completions',
      cerebras: 'https://api.cerebras.ai/v1/chat/completions',
      sambanova: 'https://api.sambanova.ai/v1/chat/completions',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions'
    };

    if (!endpoints[provider]) return "New Chat";

    try {
      const response = await fetch(endpoints[provider], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 200, 
          stream: false   
        })
      });

      if (!response.ok) throw new Error('Title API failed');

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "New Chat";
    } catch (e) {
      console.warn("Title generation failed, using default", e);
      return "New Chat";
    }
  }

  get currentSession() {
    return this.sessions.find(s => s.id === this.currentSessionId);
  }

  async createNewSession() {
    const currentSession = this.currentSession;

    if (!currentSession || currentSession?.messages.some(s => s.role !== 'system')) {
      const id = uuidv4();
      const newSession = {
        id,
        title: 'New Chat',
        messages: [{ role: 'system', content: this.settings.systemPrompt }],
        createdAt: new Date().toISOString()
      };
      this.sessions.unshift(newSession);
      this.currentSessionId = id;
      await this.saveCurrentSession();
    }
  }

  async deleteSession(id) {
    await db.del('sessions', id);
    this.sessions = this.sessions.filter(s => s.id !== id);
    if (this.currentSessionId === id) {
      this.currentSessionId = this.sessions[0]?.id || null;
      if (!this.currentSessionId) await this.createNewSession();  await db.put('settings', this.currentSessionId, 'lastSessionId');
    }
  }

  addMessage(role, content) {
    if (!this.currentSession) return;

    this.currentSession.messages.push({ role, content });
    if (this.currentSession.messages.length === 3 && role === 'assistant') {
      const firstUserMsg = this.currentSession.messages[1].content;
      // this.currentSession.title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '');
    }
    if(!this.isTemporary) {
    this.saveCurrentSession();
    }
  }

  updateLastMessage(content) {
    if (!this.currentSession) return;
    const msgs = this.currentSession.messages;
    if (msgs.length > 0) {
      msgs[msgs.length - 1].content = content;
      if(!this.isTemporary) {
      this.saveCurrentSession();
      }
    }
  }
}

export const appState = new AppState();
