<script lang="ts">
  import { Trophy } from 'lucide-svelte';

  export let players: { name: string; score: number }[] = [];
</script>

<div class="flex w-full flex-col gap-2 px-8">
  {#each players as p, i}
    <div class="items flex text-white" style="justify-content: space-between;">
      <div class="flex items-center gap-2">
        {#if i === 0}
          <Trophy class="h-8 w-8 text-yellow-500" />
        {:else if i === 1}
          <Trophy class="h-8 w-8 text-gray-500" />
        {:else if i === 2}
          <Trophy class="h-8 w-8 text-yellow-900" />
        {:else}
          <span class="text-3xl font-bold">{i + 1}.</span>
        {/if}
        <span class="text-3xl font-bold uppercase">{p.name}</span>
      </div>
      <span class="text-xl font-normal">{p.score} points</span>
    </div>
  {/each}
</div>
