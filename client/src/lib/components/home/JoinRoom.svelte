<script lang="ts">
  import { Loader2 } from 'lucide-svelte';

  export let rooms: { name: string; players: number }[] | null;
  export let selectRoom: (room: string) => void;
</script>

<div class="flex flex-col gap-2">
  {#if rooms}
    {#if rooms.length === 0}
      <p class="text-center text-white">No rooms available</p>
    {/if}
    {#each rooms as r (r.name)}
      <button
        type="button"
        class="flex items-center justify-between gap-2 rounded-lg bg-white p-3 text-black"
        on:click={() => selectRoom(r.name)}
      >
        <span class="text-3xl font-bold uppercase">🎮 {r.name}</span>
        <span class="text-xl font-normal">({r.players} players)</span>
      </button>
    {/each}
  {:else}
    <div class="flex h-20 items-center justify-center gap-2">
      <Loader2 class="h-8 w-8 animate-spin text-white" />
    </div>
  {/if}
</div>
