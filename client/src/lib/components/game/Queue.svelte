<script lang="ts">
  import Piece from './Piece.svelte';

  export let queue: string[];
  export let SIZE: number;
</script>

<div class="flex justify-center rounded-lg bg-black/40 outline outline-4 outline-red-900">
  <div class="flex flex-col items-center gap-1 p-2">
    {#each queue as piece}
      <Piece {piece} {SIZE} />
    {/each}
  </div>
</div>
