<script>
import './layout.css';
import { appState } from '$lib/appState.svelte.js';
import { Button, Sidebar, Ripple } from 'svelte-libyou';

import EditSquare from '~icons/material-symbols/edit-square-outline';
import SideBarOpen from "~icons/material-symbols/left-panel-open";
import SideBarClose from "~icons/material-symbols/left-panel-close";
import Trash from "~icons/material-symbols/delete";
import Setting from "~icons/material-symbols/settings";
import TempChat from "~icons/material-symbols/chat-dashed";
import TempChatFilled from "~icons/material-symbols/chat-bubble";

import { ModeWatcher } from 'mode-watcher';
import { fade } from 'svelte/transition';
import Settings from '$lib/components/Settings.svelte';
import { browser } from '$app/environment';


let { children } = $props();
let show = $state(false);
let open = $state(false);
const getCurrentSessionTitle = () => {
  return appState.currentSession?.title;
}

const currentActiveSession = (id) => {
  if(appState.currentSessionId === id) {
    return true
  } else {return false;}
}
let searchTerm = $state('');
let sessions = $derived(appState.sessions.filter(p => {
  return p.title.toLowerCase().includes(searchTerm.toLowerCase()); 
}));
</script>

<ModeWatcher defaultMode={"dark"} />



<main class="flex h-dvh w-full">

  <Sidebar bind:isOpen={show}>
    <header class="flex mb-2 items-center gap-1 shrink-0">
      <input 
        type="text" 
        bind:value={searchTerm} 
        class="bg-surface-container-highest rounded-full border border-transparent transition focus:border-outline-variant/70 p-2.5 px-3 flex-1 min-w-0" 
        placeholder="Search..." 
      />
    </header>
    <div class="p-1 bg-surface-container flex justify-between items-center w-full my-3">
      <button class="shrink-0 p-2 rounded-full active:rounded-xl px-4 text-on-surface-variant flex transition active:bg-surface-container-highest bg-surface-container-low items-center gap-2" onclick={() => appState.createNewSession()}>
        <EditSquare />
        <span>New chat</span>
      </button>
      <Button variant="outline" class="{appState.isTemporary ? 'bg-primary-container text-on-primary-container' : ''} size-10" onclick={() => appState.isTemporary = !appState.isTemporary}>
        {@const Icon = appState.isTemporary ? TempChatFilled : TempChat}
        <Icon />
      </Button>
    </div>

    <div class="flex-1 flex flex-col min-h-0 overflow-hidden mt-5">
      <p class="font-medium text-sm ml-2 text-on-surface mb-5">Chats</p>
      <div class="flex-1 overflow-y-auto gap-2 flex flex-col pr-1">
        {#if sessions.length}
          {#each sessions as chat}
            <div 
              tabindex="0" 
              role="button" 
              onkeyup={() => {}} 
              onclick={() => {appState.currentSessionId = chat.id; show = false}} 
              transition:fade={{duration: 200}} 
              class="flex items-center transition md:p-3 active:rounded-lg rounded-full p-2.5 {currentActiveSession(chat.id) ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-transparent hover:bg-surface-container-high'} px-3 justify-between group"
            >
              <Ripple />
              <span class="pl-1 truncate flex-1 text-left">{chat.title}</span>
              <button 
                class="opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity shrink-0 ml-2" 
                onclick={(e) => {e.stopPropagation(); appState.deleteSession(chat.id)}}
              >
                <Trash />
              </button>
            </div>
          {/each}
        {:else} 
          <p transition:fade={{duration: 200}} class="text-on-surface-variant text-center my-5">Not found</p>
        {/if}
      </div>
    </div>

    <div class="shrink-0 mt-3 pt-2 border-t border-outline-variant/30">
      <Button onclick={() => {show = false; open = true}} class="size-10" variant="normal">
        <Setting />
      </Button>
    </div>
  </Sidebar>

  <div class="flex flex-col w-full">
    <header class="flex bg-surface-container shadow-md border-b border-outline-variant/50 md:justify-center items-center justify-between p-2 md:py-3.5 px-3">
      <Button variant="text" class="md:hidden text-tertiary" onclick={() => show = !show} ><SideBarOpen /></Button>
      <p class="text-xl max-w-[60vw] text-nowrap truncate md:text-2xl font-bold">{appState.isTemporary ? "Temporary chat" : getCurrentSessionTitle()}</p>
      <Button class="size-9 md:hidden" onclick={() => appState.createNewSession()}>
        <EditSquare />
      </Button>
    </header>
    {@render children()}
  </div>


  <Settings bind:open />

</main>
