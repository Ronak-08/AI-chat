<script>
import { appState } from '$lib/appState.svelte.js';
import { sendMessage } from '$lib/ai.js';
import Markdown from '$lib/components/Markdown.svelte';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { ScrollArea } from "$lib/components/ui/scroll-area";
import { Send, Settings as SettingsIcon, User, ArrowUp, Copy, Sparkles } from 'lucide-svelte';
import { onMount } from 'svelte';

let input = $state('');
let scrollViewport;
let textareaRef;
let visibleMessages = $derived(
  appState.currentSession?.messages.filter(m => m.role !== 'system') || []
);

let greeting = $derived.by(() => {
  const h = new Date().getHours();
  if (h < 5) return 'Hello';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
});


function adjustHeight() {
  if(textareaRef) {
    textareaRef.style.height = 'auto';
    textareaRef.style.height = textareaRef.scrollHeight + 'px';
  }
}

$effect(() => {
  const loaded = appState.isInitialized;
  const sessionId = appState.currentSessionId;
  const msgCount = appState.currentSession?.messages.length;

  if (loaded && scrollViewport) {
    setTimeout(() => {
      scrollViewport.scrollTo({ 
        top: scrollViewport.scrollHeight, 
        behavior: 'smooth' 
      });
    }, 100);
  }
});

async function handleSubmit(e) {
  e?.preventDefault();
  if (!input.trim() || appState.isLoading) return;
  const msg = input;
  input = ''; 
  if(textareaRef) textareaRef.style.height = 'auto';
  await sendMessage(msg);
}
</script>

<div class="flex-1 flex flex-col relative overflow-hidden">
  <div class="flex-1 overflow-y-auto p-4" bind:this={scrollViewport}>

    {#if visibleMessages.length === 0}
      <div class="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 select-none pb-32">
        <div class="bg-muted/40 rounded-full p-4 mb-2 animate-in fade-in zoom-in duration-500">
          <Sparkles class="size-8 text-muted-foreground" />
        </div>
        <h2 class="text-2xl font-semibold tracking-tight animate-in slide-in-from-bottom-2 duration-500">
          {greeting}
        </h2>
      </div>

    {:else}
      <div class="max-w-3xl mx-auto space-y-6 pb-20">
        {#if appState.currentSession}
          {#each appState.currentSession.messages as msg}
            {#if msg.role !== 'system'}
              <div class="flex gap-4 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">

                <div class="max-w-[95%] overflow-x-auto rounded-2xl px-4 py-2 text-sm shadow-sm
                  {msg.role === 'user'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-card border'}">

                  {#if msg.role === 'assistant'}
                    <Markdown content={msg.content} />

                    {#if msg.content}
                      <button 
                        onclick={() => navigator.clipboard.writeText(msg.content)}
                        class="mt-1 opacity-60 hover:opacity-100 transition"
                      >
                        <Copy class="size-3" />
                      </button>
                    {/if}

                  {:else}
                    <p class="whitespace-pre-wrap">{msg.content}</p>
                  {/if}

                </div>
              </div>
            {/if}
          {/each}
          {#if appState.isLoading}
            <div class="flex justify-start px-4">
              <span class="text-sm text-muted-foreground animate-pulse">Generating...</span>
            </div>
      {/if}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Input Box -->
  <div class="p-4 bg-background w-full">
    <div class="max-w-3xl mx-auto">

      <div class="relative flex items-center gap-2 bg-muted/40 border ring-offset-background
        focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-[18px]
        p-2 transition-all! shadow-sm">

        <textarea
          bind:this={textareaRef}
          bind:value={input}
          oninput={adjustHeight}
          rows="1"
          placeholder="Ask Anything..."
          class="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none p-1
          max-h-48 text-sm outline-none placeholder:text-muted-foreground"
          disabled={appState.isLoading}
        ></textarea>

        <Button
          onclick={handleSubmit}
          size="icon"
          class="rounded-full size-8 mr-1 shrink-0 transition-all! 
          {input.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}"
          disabled={!input.trim() || appState.isLoading}
        >
          <ArrowUp class="size-5" />
        </Button>

      </div>

      <p class="text-center text-[10px] text-muted-foreground mt-2 opacity-70">
        AI can make mistakes. Check important info. ({appState.settings.model})
      </p>
    </div>
  </div>
</div>
