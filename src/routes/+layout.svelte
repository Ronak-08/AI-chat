<script>
import './layout.css';
import { appState } from '$lib/appState.svelte.js';
import { SidebarProvider, SidebarTrigger } from "$lib/components/ui/sidebar";
import AppSidebar from "$lib/components/AppSidebar.svelte";
import { SquarePen } from 'lucide-svelte';
import { Button } from '$lib/components/ui/button';
import Settings from '$lib/components/Settings.svelte';
import { ModeWatcher } from 'mode-watcher';
let { children } = $props();
</script>

<ModeWatcher />
<Settings />

<SidebarProvider>
  <AppSidebar />
  <main class="flex flex-1 flex-col h-dvh overflow-hidden w-full bg-background text-foreground">
    <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <div class="w-px h-4 bg-border mx-2"></div>

      <h1 class="font-medium text-md truncate flex-1">
        {appState.currentSession?.title || 'New Chat'}
      </h1>

      <Button 
        variant="ghost" 
        size="icon" 
        class="shrink-0" 
        onclick={() => appState.createNewSession()}
        title="New Chat"
      >
        <SquarePen class="size-4" />
      </Button>
    </header>

    {@render children()}
  </main>
</SidebarProvider>
