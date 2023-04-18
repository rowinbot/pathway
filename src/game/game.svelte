<script lang="ts">
  import Lobby from "./lobby.svelte";

  export let gameId: string;
</script>

<div class="font-black text-5xl">
  <h1 class="break-all">Hello {gameId}!</h1>
</div>

<Lobby />
