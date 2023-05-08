<script lang="ts">
  const width = 240;
  const height = 336 / 1.6;

  export let bgColor: string = "#fff";
</script>

<svg
  width="100%"
  viewBox="0 0 {width} {height}"
  fill="none"
  class="text-5xl rounded-lg shadow-md"
  xmlns="http://www.w3.org/2000/svg"
  on:click
  on:keydown
>
  <rect {width} {height} rx="11" fill={bgColor} />
  <rect {width} {height} rx="11" fill={bgColor} />

  <slot />
</svg>
