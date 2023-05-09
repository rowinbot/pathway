<script lang="ts">
  const width = 240;
  const height = 336 / 1.7;

  export let bgColor: string = "#fff";
  export let disabled: boolean = false;
</script>

<button {disabled} on:click>
  <svg
    width="100%"
    viewBox="0 0 {width} {height}"
    fill="none"
    class="text-5xl rounded-lg border-[1px] border-gray-300"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect {width} {height} rx="11" fill={bgColor} />
    <rect {width} {height} rx="11" fill={bgColor} />

    <slot />
  </svg>
</button>
