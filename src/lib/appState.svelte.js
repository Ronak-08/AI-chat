import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import * as db from '$lib/db';

class AppState {
  settings = $state({
    provider: 'pollinations',
    keys: {},
    model: 'openai',
    systemPrompt: 'You are a helpful, minimal AI assistant.'
  });

  sessions = $state([]);
  currentSessionId = $state(null);
  isLoading = $state(false);
  isSettingsOpen = $state(false);
  isInitialized = $state(false);

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

  get currentSession() {
    return this.sessions.find(s => s.id === this.currentSessionId);
  }

  async createNewSession() {
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
      this.currentSession.title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '');
    }
    this.saveCurrentSession();
  }

  updateLastMessage(content) {
    if (!this.currentSession) return;
    const msgs = this.currentSession.messages;
    if (msgs.length > 0) {
      msgs[msgs.length - 1].content = content;
      this.saveCurrentSession();
    }
  }
}

export const appState = new AppState();
