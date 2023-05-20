<script>
  import { fly } from "svelte/transition";
  import { notifications } from "./notifications";

  export let themes = {
    danger: "#E22D69",
    success: "#84C991",
    warning: "#f0ad4e",
    info: "#5b20de",
    default: "#000000",
  };
</script>

<div
  class="fixed bottom-10 space-y-4 left-[50%] translate-x-[-50%] mx-auto flex flex-col justify-start items-center z-50 min-w-[200px]"
>
  {#each $notifications as notification (notification.id)}
    <div
      class="rounded-full shadow-lg"
      style="background: {themes[notification.type]};"
      in:fly={{ y: 20 }}
      out:fly={{ y: 10 }}
    >
      <span class="p-6 py-4 block text-white font-medium text-sm">
        {notification.message}
      </span>
    </div>
  {/each}
</div>
