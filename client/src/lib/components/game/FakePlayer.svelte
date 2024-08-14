<script lang="ts">
  export let width: number = 10;
  export let height: number = 20;
  export let SIZE: number;

  const GAP = 0.25;
</script>

<div class="flex flex-col items-center" style="gap: {SIZE}vh">
  <span class="invisible">0</span>
  <div
    class="relative isolate flex flex-col gap-4 rounded-xl bg-black/40 outline outline-4 outline-red-700/20"
    style="width: {width * SIZE + (width + 1) * GAP}vh; height: {(height + 0.5) * SIZE + height * GAP}vh;"
  ></div>
</div>
