<script lang="ts">
  export let rooms: number;
  export let tab: string;
  import { Swords } from 'lucide-svelte';
</script>

<div class="flex w-full gap-2">
  <button type="button" class="w-full rounded-lg bg-white p-3 text-3xl text-black" on:click={() => (tab = 'join')}>
    <span class="font-bold uppercase">JOIN</span>
    <span class="tfont-normal">({rooms})</span>
  </button>
  <button
    type="button"
    class="w-full rounded-lg bg-white p-3 text-3xl font-bold uppercase text-black"
    on:click={() => (tab = 'create')}
  >
    CREATE
  </button>
</div>
<button
  class="flex items-center justify-center gap-2 rounded-lg border-2 border-white p-3 text-3xl font-bold uppercase text-white"
  on:click={() => (tab = 'leaderboard')}
>
  <Swords class="h-8 w-8" />
  LEADERBOARD
</button>
