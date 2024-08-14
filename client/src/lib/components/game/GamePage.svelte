<script lang="ts">
  import { onMount } from 'svelte';
  import { socket } from '@lib/socket';
  import Listener from '../Listener.svelte';
  import Player from './Player.svelte';
  import { pseudo, type Player as PlayerType } from '@lib/index';
  import FakePlayer from './FakePlayer.svelte';
  import { Eye, Home, Repeat, Undo2 } from 'lucide-svelte';
  import Scoreboard from '../Scoreboard.svelte';
  import background from '@assets/background.webp';
  import logo from '@assets/logo.png';

  let status: 'connecting' | 'starting' | 'playing' | 'waiting' | 'ended' = 'connecting';
  let isHost = false;
  let players: PlayerType[] = [];
  let player: PlayerType;
  let others: PlayerType[] = [];
  let countdown: number;
  let spaceCooldown = false;
  let socketConnected = false;
  let spectators = 0;
  let error: string | undefined;
  let holdingMode: boolean;

  export let roomName: string;
  export let playerName: string;
  export let hold: boolean;
  export let barbate: boolean;

  onMount(() => {
    socket.on('connect', () => (socketConnected = true));
    socket.on('disconnect', () => (socketConnected = false));
    socket.emit('join-room', { roomName, playerName, hold, barbate });
  });

  function keydown(e: KeyboardEvent) {
    if (status !== 'playing') return;
    if (e.key === ' ') {
      if (spaceCooldown) return;
      socket.emit('keydown', e.key);
      spaceCooldown = true;
      return;
    }
    socket.emit('keydown', e.key);
  }

  function keyup(e: KeyboardEvent) {
    if (e.key === ' ') spaceCooldown = false;
  }

  function rerender(data: any) {
    status = data.status;
    isHost = data.host === playerName;
    players = data.players;
    player = data.players.find((p: PlayerType) => p.name === playerName);
    others = data.players.filter((p: PlayerType) => p.name !== playerName);
    countdown = data.countdown;
    spectators = data.spectators;
    holdingMode = !!data.hold;
  }

  function sortPlayers(players: PlayerType[] = []) {
    return players.sort((a, b) => {
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
      if (a.lostAt && b.lostAt && a.lostAt < b.lostAt) return 1;
      if (a.lostAt && b.lostAt && a.lostAt > b.lostAt) return -1;
      return 0;
    });
  }

  function leaveRoom() {
    socket.disconnect();
    window.location.href = '/';
  }

  function restartGame() {
    socket.emit('restart-game');
  }
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />
<Listener event="update" handler={rerender} />
<Listener event="room-join-failed" handler={(e) => (error = e)} />

<div class="relative isolate h-screen w-full">
  <img src={background} alt="background" class="absolute inset-0 z-0 h-screen w-full object-cover" />
  <div class="absolute inset-0 z-10 h-screen w-full bg-black opacity-60"></div>
  <div class="absolute inset-0 z-20 flex h-full items-center justify-center p-20">
    {#if socketConnected}
      <div class="flex h-full w-full items-center justify-center gap-16">
        {#if player}
          <Player {player} showHold={holdingMode} showQueue showConfetti />
        {/if}
        <div class="flex h-full max-w-3xl flex-wrap justify-center gap-12">
          {#each Array(6) as _, i}
            {#if others[i]}
              <Player player={others[i]} SIZE={1.3} specter />
            {:else}
              <FakePlayer SIZE={1.3} />
            {/if}
          {/each}
        </div>
      </div>
    {:else if status !== 'connecting'}
      <div class="flex flex-col items-center gap-4">
        <h1 class="text-4xl font-bold text-white">Disconnected from server</h1>
        <button class="rounded-lg bg-red-500 px-4 py-2 font-bold text-white" on:click={() => window.location.reload()}>
          Try again
        </button>
      </div>
    {/if}
  </div>
  {#if status !== 'playing'}
    <div class="absolute inset-0 z-30 h-screen w-full bg-black opacity-60"></div>
    <div class="absolute inset-0 z-40 flex h-full items-center justify-center p-20">
      {#if error}
        <div class="flex flex-col items-center gap-4">
          <h1 class="text-4xl font-bold text-red-500">{error}</h1>
          <button
            class="rounded-lg bg-red-500 px-4 py-2 font-bold text-white"
            on:click={() => {
              $pseudo = null;
              window.location.href = '/';
            }}
          >
            Disconnect
          </button>
        </div>
      {:else if status === 'starting'}
        <h1 class="text-7xl font-bold text-white">
          {countdown}
        </h1>
      {:else if status === 'connecting'}
        <h1 class="text-4xl font-bold text-white">Connecting to server...</h1>
      {:else if status === 'waiting'}
        {#if isHost}
          <div class="flex flex-col items-center gap-3">
            <h1 class="text-4xl font-bold text-white">Ready to start ?</h1>
            <button class="rounded-lg bg-green-500 px-4 py-2 font-bold text-white" on:click={() => socket.emit('start-game')}>
              Start
            </button>
          </div>
        {:else}
          <h1 class="text-4xl font-bold text-white">Waiting for host to start...</h1>
        {/if}
      {:else if status === 'ended'}
        <div class="flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl bg-black/60 p-8">
          <img src={logo} alt="logo" class="mx-auto h-32" />
          <h1 class="text-4xl font-bold text-white">Game over</h1>

          <Scoreboard players={sortPlayers(players)} />

          <div class="flex gap-4">
            <button
              class="flex items-center gap-2 rounded-lg border-2 border-green-400 px-4 py-2 font-bold text-green-400"
              on:click={restartGame}
              disabled={!isHost}
            >
              <Repeat class="h-6 w-6" />
              Play again
            </button>

            <button
              class="flex items-center gap-2 rounded-lg border-2 border-red-400 px-4 py-2 font-bold text-red-400"
              on:click={() => (window.location.href = '/home')}
            >
              <Home class="h-6 w-6" />
              Home
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
  <div class="absolute left-0 top-0 z-50 p-4">
    <button on:click={leaveRoom} class="text-white">
      <Undo2 class="h-8 w-8" />
    </button>
  </div>
  {#if spectators > 0}
    <div class="absolute right-0 top-0 z-50 flex items-center gap-2 p-4">
      <span class="text-white">{spectators}</span>
      <Eye class="h-8 w-8 text-white" />
    </div>
  {/if}
</div>
