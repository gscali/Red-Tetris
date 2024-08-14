<script lang="ts">
  import { colors } from '../../models/Pieces';
  import Cell from './Cell.svelte';
  import { Confetti } from 'svelte-confetti';
  import Listener from '../Listener.svelte';

  export let map: string[][];
  export let gameOver: boolean;
  export let SIZE = 3.5;
  export let showConfetti = false;

  const GAP = 0.25;
  const audio = new Audio('/barbate.mp3');

  let width = map[0].length;
  let height = map.length - 2;

  let confettis: {
    x: number;
    y: number;
    color: string;
  }[] = [];

  function getCellCenter(x: number, y: number) {
    return {
      x: x * SIZE + x * GAP + SIZE / 2,
      y: y * SIZE + y * GAP + SIZE / 2
    };
  }

  function spawnConfetti(x: number, y: number, color: string) {
    let coords = getCellCenter(x, y);

    confettis = [
      ...confettis,
      {
        x: coords.x,
        y: coords.y,
        color
      }
    ];
  }

  function barbateRow(cells: { x: number; y: number; name: string }[]) {
    for (let cell of cells) spawnConfetti(cell.x, cell.y, colors[cell.name]);
    audio.play();
  }
</script>

{#if showConfetti}
  <Listener event="barbate-row" handler={barbateRow} />
{/if}

<div
  class="relative isolate flex flex-col gap-4 rounded-xl bg-black/40 outline outline-4 outline-red-700"
  style="width: {width * SIZE + (width + 1) * GAP}vh; height: {(height + 0.5) * SIZE + height * GAP}vh;"
>
  {#if gameOver}
    <div class="absolute inset-0 z-20 rounded-xl bg-black/50 blur"></div>
    <div class="absolute inset-0 z-30 flex items-center justify-center">
      <h1 class="text-center font-bold text-white" style="font-size: {SIZE * 1.2}vh;">Game Over 😢</h1>
    </div>
  {/if}
  <div
    class="absolute bottom-0 z-10 grid"
    style="gap: {GAP}vh; padding: {GAP}vh; grid-template-columns: repeat({width}, minmax(0, 1fr));"
  >
    {#each map.toReversed() as row}
      {#each row as cell}
        <Cell {cell} size={SIZE} />
      {/each}
    {/each}
  </div>
  {#if showConfetti}
    {#each confettis as confetti}
      <div class="absolute z-20" style={`bottom: ${confetti.y}vh; left: ${confetti.x}vh`}>
        <Confetti x={[-0.1, 0.1]} y={[-0.1, 0.1]} colorArray={[confetti.color]} />
      </div>
    {/each}
  {/if}
</div>
