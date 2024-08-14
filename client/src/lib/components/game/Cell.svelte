<script lang="ts">
  import { colors } from '../../models/Pieces';
  import barbaBall from '@assets/barba_ball.png';

  export let cell: string;
  export let size: number;
</script>

{#if cell === ''}
  <div style={`height: ${size}vh; width: ${size}vh; border-radius: ${size / 5}vh;`}></div>
{:else if cell === 'target'}
  <div
    style={`height: ${size}vh; width: ${size}vh; border-width: ${size / 10}vh; border-radius: ${size / 5}vh;`}
    class="border-white"
  ></div>
{:else}
  <div
    style={`height: ${size}vh; width: ${size}vh; background-color: ${colors[cell]}; border-width: ${size / 10}vh; border-radius: ${size / 5}vh;`}
    class="border-[3px] border-black/30"
  >
    {#if cell == 'barbate'}
      <img src={barbaBall} alt="barbate" class="h-full w-full" />
    {/if}
  </div>
{/if}
