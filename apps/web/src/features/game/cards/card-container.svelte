<script lang="ts">
  const width = 240;
  const height = 336 / 1.6;

  export let occupied: boolean = false;
</script>

<svg
  width="100%"
  viewBox="0 0 {width} {height}"
  fill="none"
  class="text-5xl rounded-lg shadow-md"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect {width} {height} rx="11" fill={occupied ? "#bff" : "#fff"} />
  <rect {width} {height} rx="11" fill={occupied ? "#bff" : "#fff"} />

  <slot />
</svg>
