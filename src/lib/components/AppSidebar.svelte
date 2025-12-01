<script>
import { appState } from '$lib/appState.svelte.js';
import * as Sidebar from "$lib/components/ui/sidebar";
import { Plus, MessageSquare, Trash2, Bot, Sun,Moon, Settings} from "lucide-svelte";
import Button from "$lib/components/ui/button/button.svelte";
import { toggleMode } from 'mode-watcher';
import { Input } from "$lib/components/ui/input"; 
import { useSidebar } from "$lib/components/ui/sidebar";

let searchQuery = $state('');
let sidebar = useSidebar();

let filteredSessions = $derived(
  appState.sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
);
</script>

<Sidebar.Root>
  <Sidebar.Header>
    <div class="flex flex-row gap-2 items-center pt-2">
      <div tabindex="0" class="w-0 h-0 overflow-hidden opacity-0"></div>
      <Input 
        placeholder="Search chats..." 
        class="h-10 w-full rounded-full bg-background shadow-none" 
        bind:value={searchQuery}
        autofocus={false}
      />
      <Button class="h-[2.2rem] w-[2.2rem] justify-center rounded-full" onclick={() => appState.createNewSession()}>
        <Plus class="size-5" />
      </Button>
    </div>

  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel class="my-2">
        {searchQuery ? 'Search Results' : 'Recent Chats'}
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent class="mt-2">
        <Sidebar.Menu>
          {#each filteredSessions as session}
            <Sidebar.MenuItem class="px-1">
              <Sidebar.MenuButton 
                isActive={appState.currentSessionId === session.id}
                onclick={() => appState.currentSessionId = session.id}
                class="w-full justify-between group h-auto py-3"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <MessageSquare class="size-4 shrink-0" />
                  <span class="truncate">{session.title}</span>
                </div>
                <div 
                  role="button" 
                  tabindex="0"
                  onclick={(e) => { e.stopPropagation(); appState.deleteSession(session.id); }}
                  onkeydown={(e) => e.key === 'Enter' && appState.deleteSession(session.id)}
                >
                  <Trash2 class="size-4 text-muted-foreground" />
                </div>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}

          {#if filteredSessions.length === 0}
            <div class="px-2 py-4 text-xs text-muted-foreground text-center">
              No chats found.
            </div>
          {/if}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer class="flex flex-row m-2">
    <Button onclick={() => {
      appState.isSettingsOpen = true;
      sidebar.setOpenMobile(false);
    }} variant="secondary" >
      <Settings class="h-[1.2rem] w-[1.2rem]" />
    </Button>
    <Button onclick={toggleMode} variant="outline" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all! dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all! dark:rotate-0 dark:scale-100"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </Sidebar.Footer>

  <Sidebar.Rail />
</Sidebar.Root>
