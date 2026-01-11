<script>
  import { appState } from "$lib/appState.svelte.js";
  import { sendMessage } from "$lib/ai.js";
  import { onMount } from "svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import { Button } from "svelte-libyou";

  import Send from "~icons/material-symbols/send-outline";
  import Refresh from "~icons/material-symbols/refresh";
  import SettingsIcon from "~icons/material-symbols/settings-outline";
  import User from "~icons/material-symbols/person-outline";
  import ArrowUp from "~icons/material-symbols/arrow-upward";
  import Copy from "~icons/material-symbols/content-copy-outline";
  import Sparkles from "~icons/material-symbols/auto-awesome-outline";

  let input = $state("");
  let scrollViewport;
  let textareaRef;
  let visibleMessages = $derived(
    appState.currentSession?.messages.filter((m) => m.role !== "system") || [],
  );

  let greeting = $derived.by(() => {
    const h = new Date().getHours();
    if (h < 5) return "Hello";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  function adjustHeight() {
    if (textareaRef) {
      textareaRef.style.height = "auto";
      textareaRef.style.height = textareaRef.scrollHeight + "px";
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
          behavior: "smooth",
        });
      }, 100);
    }
  });

  async function regenerateLastMessage(lastMessage) {
    if (!appState.currentSession || appState.isLoading) return;

    const messages = appState.currentSession.messages;
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    if (!lastAssistant || !lastUser) return;

    const index = messages.lastIndexOf(lastAssistant);
    const userIndex = messages.lastIndexOf(lastUser);
    messages.splice(index, 1);
    messages.splice(userIndex, 1);

    await sendMessage(lastUser.content);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!input.trim() || appState.isLoading) return;
    const msg = input;
    input = "";
    if (textareaRef) textareaRef.style.height = "auto";
    await sendMessage(msg);
  }

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="flex-1 flex flex-col relative overflow-hidden">
  <div class="flex-1 overflow-y-auto p-4" bind:this={scrollViewport}>
    {#if visibleMessages.length === 0}
      <div
        class="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 select-none pb-32"
      >
        <div
          class="bg-surface-container-low rounded-full p-4 mb-3 animate-in fade-in zoom-in duration-500"
        >
          <Sparkles class="size-8 text-on-surface-variant" />
        </div>
        <h2
          class="text-3xl mt-4 font-black animate-in slide-in-from-bottom-2 duration-500"
        >
          {greeting}
        </h2>
      </div>
    {:else}
      <div class="max-w-3xl mx-auto space-y-6 pb-20">
        {#if appState.currentSession}
          {#each appState.currentSession.messages as msg, i}
            {#if msg.role !== "system"}
              <div
                class="flex gap-4 {msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'}"
              >
                <div
                  class="overflow-x-auto rounded-3xl px-4 py-2
                  {msg.role === 'user'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container'}"
                >
                  {#if msg.role === "assistant"}
                    <Markdown content={msg.content} />

                    <div class="flex my-2 items-center gap-2">
                      {#if msg.content}
                        <button
                          onclick={() =>
                            navigator.clipboard.writeText(msg.content)}
                          class="opacity-60 hover:opacity-100 transition"
                        >
                          <Copy class="size-4" />
                        </button>
                        {#if i === appState.currentSession.messages.length - 1}
                          <button
                            onclick={regenerateLastMessage}
                            disabled={appState.isLoading}
                            class="opacity-60 transition hover:opacity-100 hover:text-primary"
                          >
                            <Refresh class="size-4" />
                          </button>
                        {/if}
                      {/if}
                    </div>
                  {:else}
                    <p class="whitespace-pre-wrap">{msg.content}</p>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
          {#if appState.isLoading}
            <div class="flex justify-start px-4">
              <span class="rounded-full bg-gray-300 size-4 animate-pulse"
              ></span>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Input Box -->
  <div class="p-4 w-full">
    <div class="max-w-3xl mx-auto">
      <form
        onsubmit={handleSubmit}
        class="relative items-center flex gap-2 bg-surface-container rounded-3xl
        p-2 transition-all! shadow-sm"
      >
        <textarea
          bind:this={textareaRef}
          bind:value={input}
          onkeydown={handleKeydown}
          oninput={adjustHeight}
          rows="1"
          placeholder="Ask Anything..."
          class="flex-1 text-on-surface w-full bg-transparent border-none focus:ring-0 px-2 resize-none p-1
          max-h-48 outline-none placeholder:text-on-surface-variant/60"
          disabled={appState.isLoading}
        ></textarea>

        <Button
          onclick={handleSubmit}
          type="submit"
          class="rounded-full size-9 mr-1 mt-auto shrink-0 transition-all! 
          {input.trim() ? 'opacity-100 scale-100' : 'opacity-30 scale-85'}"
          disabled={!input.trim() || appState.isLoading}
        >
          <ArrowUp class="size-5" />
        </Button>
      </form>
    </div>
  </div>
</div>
