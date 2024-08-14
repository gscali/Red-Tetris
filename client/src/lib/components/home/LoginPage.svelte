<script lang="ts">
  import { pseudo } from '../../index';
  import logo from '@assets/logo.png';

  let p = '';

  function enterPseudo() {
    pseudo.set(p.trim());
    p = '';
  }
</script>

<form class="flex w-full max-w-xl flex-col gap-4 rounded-3xl bg-black/60 p-8" on:submit|preventDefault={enterPseudo}>
  <img src={logo} alt="logo" class="mx-auto h-32" />
  <input
    bind:value={p}
    type="text"
    class="mt-4 rounded-lg bg-white/20 p-3 text-xl text-white focus:outline-none"
    placeholder="Username"
  />
  <button
    disabled={p.trim().length < 3}
    type="submit"
    class="rounded-lg bg-white p-3 text-3xl font-bold uppercase text-black disabled:opacity-50"
  >
    LOG IN
  </button>
</form>
