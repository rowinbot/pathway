<script lang="ts">
  let name = "Robin";
</script>

<div class="font-black text-5xl">
  <h1 class="break-all">Hello {name}!</h1>
  <input bind:value={name} />
</div>
