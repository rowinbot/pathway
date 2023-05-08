<script lang="ts">
  import { fade, fly } from "svelte/transition";

  export let color: string;
</script>

<g class="-translate-y-12" transition:fly={{ y: -80, opacity: 1 }}>
  <circle cx="120" cy="168.5" r="40.5" fill={color} />
  <circle cx="120" cy="168.5" r="30" stroke="#fff" stroke-width="4" />
</g>
