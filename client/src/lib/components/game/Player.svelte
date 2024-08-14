<script lang="ts">
  import Grid from './Grid.svelte';
  import Hold from './Hold.svelte';
  import Queue from './Queue.svelte';
  import type { Player } from '../../index';

  export let player: Player;
  export let showHold: boolean = false;
  export let showQueue: boolean = false;
  export let showConfetti: boolean = false;
  export let specter: boolean = false;
  export let SIZE = 3.5;
</script>

<div class="flex flex-col items-center" style="gap: {SIZE}vh">
  <div class="flex items-center gap-4" style="font-size: {SIZE * 1.5}vh;">
    <h1 class="text-white">{player.name}</h1>
    <h2 class=" font-[Tetris] tracking-widest text-white">{player.score}</h2>
  </div>
  <div class="flex items-start justify-center" style="gap: {SIZE * 1.2}vh">
    {#if showHold}
      <div class="flex flex-col items-center gap-4">
        <Hold hold={player.hold} {SIZE} />
      </div>
    {/if}
    <Grid map={specter ? player.specter : player.map} gameOver={player.gameOver} {SIZE} {showConfetti} />
    {#if showQueue}
      <Queue queue={player.queue} {SIZE} />
    {/if}
  </div>
</div>
