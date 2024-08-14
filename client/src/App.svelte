<script>
  import { pseudo } from './lib';
  import LoginPage from './lib/components/home/LoginPage.svelte';
  import MainPage from './lib/components/home/MainPage.svelte';
  import background from '@assets/background.webp';
  import { onMount } from 'svelte';
  import GamePage from './lib/components/game/GamePage.svelte';

  let room = '';
  let hold = false;
  let barbate = false;

  onMount(() => {
    let path = window.location.pathname;

    let args = path.split('/');
    console.log(args);
    if (args.length === 3) {
      room = args[1].replace(/_/g, ' ');
      $pseudo = args[2].replace(/_/g, ' ');
    } else if (path !== '/') {
      window.location.href = '/';
    }

    let params = new URLSearchParams(window.location.search);
    hold = params.get('hold') == 'true';
    barbate = params.get('barbate') == 'true';
  });
</script>

{#if room}
  <GamePage roomName={room} playerName={$pseudo ?? ''} {hold} {barbate} />
{:else}
  <div class="relative isolate h-screen w-full">
    <div class="absolute inset-0 z-10 h-screen w-full bg-black opacity-60"></div>
    <img src={background} alt="background" class="absolute inset-0 z-0 h-screen w-full object-cover" />
    <div class="absolute inset-0 z-20 flex items-center justify-center p-2">
      {#if $pseudo}
        <MainPage />
      {:else}
        <LoginPage />
      {/if}
    </div>
  </div>
{/if}
