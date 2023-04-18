<script lang="ts">
  const width = 240;
  const height = 336;
</script>

<svg
  width="100%"
  viewBox="0 0 {width} {height}"
  fill="none"
  class="text-5xl"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect {width} {height} rx="11" fill="white" />
  <rect {width} {height} rx="11" fill="white" />

  <slot />
</svg>
