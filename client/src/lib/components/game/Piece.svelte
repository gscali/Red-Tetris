<script lang="ts">
  import { pieces } from '../../models/Pieces';
  import Cell from './Cell.svelte';
  import barbaBall from '@assets/barba_ball.png';

  export let piece: string;
  export let SIZE: number;

  function get_piece_representation(piece: string) {
    if (!piece) return [];
    let p = pieces[piece];
    return p;
  }
</script>

<div class="flex flex-col items-center justify-center" style="width: {SIZE}vh; height: {SIZE}vh;">
  {#if piece === 'barbate'}
    <img src={barbaBall} alt="barbate" class="h-full w-full" />
  {:else}
    {#each get_piece_representation(piece) as row}
      <div class="flex">
        {#each row as cell}
          <Cell cell={!cell ? '' : piece} size={SIZE / 4} />
        {/each}
      </div>
    {/each}
  {/if}
</div>
