<script>
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { notifications } from "./notifications";

  export let themes = {
    danger: "#E22D69",
    success: "#84C991",
    warning: "#f0ad4e",
    info: "#5b20de",
    default: "#000",
  };
</script>

<div
  class="bottom-20 space-y-4 fixed inset-x-0 mx-auto flex flex-col justify-start items-center pointer-events-none z-50"
>
  {#each $notifications as notification (notification.id)}
    <div
      class="rounded-lg"
      style="background: {themes[notification.type]};"
      in:fly={{ y: 10 }}
      out:fly={{ y: 10 }}
    >
      <div class="p-4 block text-white font-lg">{notification.message}</div>
      {#if notification.icon}<i class={notification.icon} />{/if}
    </div>
  {/each}
</div>
