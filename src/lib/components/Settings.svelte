<script>
import { appState } from "$lib/appState.svelte";
let {open = $bindable(false)} = $props();
import Close from "~icons/material-symbols/close";
import Button from "../../../../svelte-libYou/dist/components/Button.svelte";
import { fade } from "svelte/transition";
import Textfield from "../../../../svelte-libYou/dist/components/Textfield.svelte";
    import ThemeToggle from "./ThemeToggle.svelte";

let saveTimeout;


$effect(() => {
  $state.snapshot(appState.settings);

  const timer = setTimeout(() => {
    appState.saveSettings();
  }, 300);

  return () => clearTimeout(timer);
});

function addKey(model, val) {
  appState.settings.keys[model] = val;
}

</script>

{#if open}
  <main transition:fade={{duration: 200}} class="fixed z-200 md:w-[40%] md:h-full overflow-y-auto flex flex-col md:m-0 p-5 inset-0 bg-surface-container m-3 rounded-3xl h-[95%]">
    <header class="flex items-center px-1 justify-between">
      <h1 class="text-4xl text-on-surface font-bold p-2">Settings</h1>
      <Button class="size-10" onclick={() => open = false} variant="normal"><Close /></Button>
    </header>

    <div class="flex rounded-xl p-2 bg-surface-container-high items-center transition justify-between px-3 mx-3 mt-8">
      <p class="pl-1 font-medium">Theme</p>
    <ThemeToggle />
    </div>


    <div class="flex flex-col m-2 mt-8 gap-2">
      <div class="flex transition hover:rounded-3xl hover:bg-primary-container hover:text-on-primary-container bg-surface-container-high items-center rounded-xl p-3 justify-between">
        <p class="pl-1 font-medium">Provider</p>
        <select class="px-3 text-tertiary outline-none w-28 py-1 bg-surface-container-low rounded-full" name="model" bind:value={appState.settings.provider} id="model-selector">
          <option value="huggingface">HuggingFace</option>
          <option value="gemini">Gemini</option>
          <option value="groq">Groq</option>
          <option value="openrouter">OpenRouter</option>
          <option value="cerebras">Cerebras</option>
          <option value="sambanova">Sambanova</option>
        </select>
      </div>

      <div class="flex mx-3 flex-col">
        <p class="mt-4 mb-2 text-secondary text-sm font-medium">Api Key</p>
        <Textfield value={appState.settings.keys[appState.settings.provider] || ''} placeholder="sk-292..." class=" w-full text-on-surface p-2" oninput={(e) => addKey(appState.settings.provider, e.target.value)} type="text" />

        <p class="mt-5 mb-2 text-sm text-secondary">Model</p>
        <Textfield bind:value={appState.settings.model[appState.settings.provider]} placeholder="Model Name" class="w-full text-on-surface p-2" type="text" />
      </div>

    </div>
    <div class="flex m-0.5 mt-7 h-fit bg-surface-container-low p-2 rounded-xl flex-col gap-1">
      <span class="m-2 text-sm text-secondary">System Prompt</span>
      <textarea class="resize-none p-3 text-on-surface h-24 m-1 border border-transparent focus:border-outline-variant outline-none bg-surface-container-high rounded-xl" bind:value={appState.settings.systemPrompt} placeholder="System Prompt" type="text"></textarea>
    </div>


  </main>
{/if}
