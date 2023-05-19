<script lang="ts">
  import { fly } from "svelte/transition";

  export let color: string;
  export let opacity: number;
</script>

<g class="-translate-y-7" transition:fly={{ y: -80, opacity: 1 }} {opacity}>
  <circle cx="120" cy="168.5" r="60" fill={color} />
  <circle cx="120" cy="168.5" r="47.5" stroke="#fff" stroke-width="4" />
</g>
