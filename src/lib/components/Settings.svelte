<script>
import { appState } from '$lib/appState.svelte.js';
import * as Dialog from "$lib/components/ui/dialog";
import { Label } from "$lib/components/ui/label";
import { Input } from "$lib/components/ui/input";
import { Separator } from "$lib/components/ui/separator";
import { Cpu, Key, MessageSquareText } from 'lucide-svelte';
    import { onMount } from 'svelte';


let open = $derived(appState.isSettingsOpen);

let defaultModel = {
  groq: "openai/gpt-oss-120b",
  cerebras: "llama-3.3-70b",
  gemini: "gemini-2.5-flash" ,
  sambanova: "DeepSeek-V3.1" ,
  openrouter: "x-ai/grok-4.1-fast:free",
}
$effect(() => {
  if (appState.isInitialized) {
    const _track = JSON.stringify(appState.settings);
    appState.saveSettings();
  }
});

onMount(() => {
  if (!appState.settings.model && appState.settings.provider) {
    appState.settings.model = defaultModel[appState.settings.provider];
  }
})

function handleProviderChange(e) {
  const selectedProvider = e.currentTarget.value;
  appState.settings.provider = selectedProvider;
  appState.settings.model = defaultModel[selectedProvider] || '';

  if (!appState.settings.keys) appState.settings.keys = {};

  if (!appState.settings.keys[selectedProvider]) {
    appState.settings.keys[selectedProvider] = '';
  }
}

</script>

<Dialog.Root open={open} onOpenChange={(v) => appState.isSettingsOpen = v}>
  <Dialog.Content class="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-none shadow-2xl z-100">

    <div class="px-6 py-4 border-b bg-muted/50">
      <Dialog.Title class="text-lg font-semibold tracking-tight">Settings</Dialog.Title>
    </div>

    <div class="p-6 space-y-6">
      <div class="space-y-4 m-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label class="text-xs text-muted-foreground">Provider</Label>
            <select 
              value={appState.settings.provider}
              onchange={() => handleProviderChange(event)}
              class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="pollinations">Pollinations.ai</option>
              <option value="cerebras">Cerebras</option>
              <option value="sambanova">SambaNova</option>
              <option value="openrouter">OpenRouter (Free)</option>
              <option value="groq">Groq Cloud</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">Model</Label>
            <Input class="mt-2" bind:value={appState.settings.model} />
          </div>
        </div>
      </div>

      <Separator />

      <!-- Credentials Section -->
      {#if appState.settings.provider !== 'pollinations'}
        <div class="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div class="grid gap-2">
            <Label class="text-xs py-2 text-muted-foreground">API Key</Label>
            <Input 
              type="password" 
              bind:value={appState.settings.keys[appState.settings.provider]} 
              placeholder="sk-..." 
              class="font-mono text-sm"
            />
          </div>
        </div>
        <Separator />
      {/if}

      <!-- System Section -->
      <div class="space-y-4">
        <div class="grid gap-2">
          <Label class="text-xs p-2 text-muted-foreground">System Prompt</Label>
          <Input bind:value={appState.settings.systemPrompt} />
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
