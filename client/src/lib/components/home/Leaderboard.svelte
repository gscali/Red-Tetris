<script lang="ts">
  import Scoreboard from '../Scoreboard.svelte';
  import { Loader2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let players: { name: string; score: number }[] = [];

  onMount(() => {
    console.log(import.meta.env.VITE_BACKEND_URL);
    fetch(import.meta.env.VITE_BACKEND_URL + '/scores')
      .then((res) => res.json())
      .then((data) => {
        players = data;
      });
  });
</script>

{#if players}
  {#if players.length === 0}
    <p class="text-center text-white">No scores available</p>
  {/if}

  <Scoreboard {players} />
{:else}
  <div class="flex h-20 items-center justify-center gap-2">
    <Loader2 class="h-8 w-8 animate-spin text-white" />
  </div>
{/if}
