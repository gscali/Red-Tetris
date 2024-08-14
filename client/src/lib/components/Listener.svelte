<script lang="ts">
  import { socket } from '../socket';
  import { onDestroy, onMount } from 'svelte';

  export let event: string;
  export let handler: (...args: any[]) => void;

  onMount(() => {
    socket.on(event, handler);
  });

  onDestroy(() => {
    socket.off(event, handler);
  });
</script>
