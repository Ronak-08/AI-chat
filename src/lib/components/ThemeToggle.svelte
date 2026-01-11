<script>
import { mode, setMode} from "mode-watcher";
import Sun from "~icons/material-symbols/light-mode";
import Moon from "~icons/material-symbols/dark-mode"
let active = $derived(mode.current || null);
</script>

<div class="flex justify-center transition p-1 gap-1 bg-surface-container rounded-full">

  <button 
    onclick={() => setMode('light')}
    class="relative flex flex-auto items-center justify-center gap-2 px-3 py-1.5 rounded-full font-medium transition  active:rounded-xl
    {active === 'light' 
      ? 'bg-primary text-on-primary shadow-sm' 
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}"
  >
    <Sun class="w-5 h-5" />
    <span>Light</span>
  </button>

  <button 
    onclick={() => setMode('dark')}
    class="relative flex flex-auto items-center justify-center gap-2 px-3 py-1.5 rounded-full font-medium transition active:rounded-xl hover:opacity-95
    {active === 'dark' 
      ? 'bg-primary text-on-primary shadow-sm' 
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}"
  >
    <Moon class="w-5 h-5" />
    <span>Dark</span>
  </button>
</div>
