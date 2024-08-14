<script lang="ts">
  import Listener from '../Listener.svelte';
  import { pseudo } from '../../index';
  import { ChevronLeft, LogOut } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import JoinRoom from './JoinRoom.svelte';
  import CreateRoom from './CreateRoom.svelte';
  import MainMenu from './MainMenu.svelte';
  import Leaderboard from './Leaderboard.svelte';
  import logo from '@assets/logo.png';

  let tab = 'select';

  let rooms: { name: string; players: number }[] | null = null;
  let tabNames: { [key: string]: string } = {
    join: 'Join a room',
    create: 'Create a room',
    leaderboard: 'Leaderboard'
  };

  onMount(async () => {
    fetch(import.meta.env.VITE_BACKEND_URL + '/rooms')
      .then((res) => res.json())
      .then((data) => {
        rooms = data;
      });
  });

  function selectRoom(room: string, holdMode: boolean = false, barbateMode: boolean = false) {
    let params = new URLSearchParams();
    if (holdMode) params.append('hold', 'true');
    if (barbateMode) params.append('barbate', 'true');
    let p = $pseudo?.replace(/ /g, '_');
    let r = room.replace(/ /g, '_');
    window.location.href = `/${r}/${p}` + (params.toString() ? '?' + params.toString() : '');
  }
</script>

<Listener
  event="room-created"
  handler={(roomName) => {
    if (!rooms) return;
    rooms = [...rooms, { name: roomName, players: 0 }];
  }}
/>

<Listener
  event="room-destroyed"
  handler={(roomName) => {
    if (!rooms) return;
    rooms = rooms.filter((r) => r.name !== roomName);
  }}
/>

<Listener
  event="room-update"
  handler={(room) => {
    if (!rooms) return;
    rooms = rooms.map((r) => (r.name === room.name ? room : r));
  }}
/>

<div class="absolute left-0 top-0 z-50 p-4">
  <button on:click={() => ($pseudo = null)} class="text-white">
    <LogOut class="h-8 w-8" />
  </button>
</div>
<div class="flex w-full max-w-xl flex-col gap-4 rounded-3xl bg-black/60 p-8">
  <img src={logo} alt="logo" class="mx-auto mb-4 h-32" />

  {#if tab === 'select'}
    <MainMenu rooms={rooms?.length ?? 0} bind:tab />
  {:else}
    <div class="grid grid-cols-[1fr,auto,1fr] gap-2">
      <button type="button" class="text-white" on:click={() => (tab = 'select')}>
        <ChevronLeft class="h-8 w-8" />
      </button>
      <h1 class="text-4xl font-bold text-white">{tabNames[tab]}</h1>
    </div>
  {/if}

  {#if tab === 'join'}
    <JoinRoom {rooms} {selectRoom} />
  {/if}

  {#if tab === 'create'}
    <CreateRoom {selectRoom} />
  {/if}

  {#if tab === 'leaderboard'}
    <Leaderboard />
  {/if}
</div>
