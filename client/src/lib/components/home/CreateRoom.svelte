<script lang="ts">
  export let selectRoom: (room: string, holdMode: boolean, barbateMode: boolean) => void;

  let room = '';
  let holdMode = true;
  let barbateMode = false;

  function submit() {
    selectRoom(room.trim(), holdMode, barbateMode);
  }
</script>

<form class="flex flex-col gap-4" on:submit|preventDefault={submit}>
  <label class="flex items-center gap-2 text-xl text-white">
    <input type="checkbox" bind:checked={holdMode} class="h-6 w-6" />
    Allow Piece Holding
  </label>
  <label class="flex items-center gap-2 text-xl text-white">
    <input type="checkbox" bind:checked={barbateMode} class="h-6 w-6" />
    Enable Barbate Mode
  </label>
  <div class="flex items-stretch gap-2">
    <input
      bind:value={room}
      type="text"
      class="w-full rounded-lg bg-white/20 p-3 text-xl text-white focus:outline-none"
      placeholder="Name"
    />
    <button
      disabled={room.trim().length < 3}
      type="submit"
      class="rounded-lg bg-white p-3 text-3xl font-bold uppercase text-black disabled:opacity-50"
    >
      CREATE
    </button>
  </div>
</form>
