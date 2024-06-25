<script lang="ts">
  import { DEFAULT_ROOM_CONFIG } from "game-logic";
  import { arc } from "@/utils/svg";
  import { onDestroy } from "svelte";

  export let durationInSeconds: number =
    DEFAULT_ROOM_CONFIG.turnTimeLimitSeconds;
  export let startTimeUTC: number;

  let interval: ReturnType<typeof setTimeout> | null = null;
  $: currentTurnDelta = durationInSeconds;

  $: {
    const limit = new Date(startTimeUTC).getTime() + durationInSeconds * 1000;
    const delta = Math.round((limit - Date.now()) / 1000);
    currentTurnDelta = delta < 0 ? 0 : delta;

    if (currentTurnDelta > 0) {
      if (interval) clearInterval(interval);

      interval = setInterval(() => {
        if (currentTurnDelta <= 0 && interval) {
          clearInterval(interval);
        }

        currentTurnDelta = Math.max(0, currentTurnDelta - 1);
      }, 1000);
    }
  }

  onDestroy(() => interval && clearInterval(interval));

  $: firstCirclePath = arc({
    x: 0,
    y: 0,
    endAngle:
      Math.abs((durationInSeconds - currentTurnDelta) / durationInSeconds - 1) *
      (2 * Math.PI),
    innerRadius: 45,
    outerRadius: 50,
  });

  $: secondCirclePath = arc({
    x: 0,
    y: 0,
    endAngle:
      Math.abs((durationInSeconds - currentTurnDelta) / durationInSeconds - 1) *
      (2 * Math.PI),
    innerRadius: 0,
    outerRadius: 50,
  });
</script>

<svg
  class="w-full aspect-square text-3xl font-bold rounded-full"
  viewBox="0 0 100 100"
  aria-label={`${currentTurnDelta} seconds left for current turn`}
>
  <circle cx="50" cy="50" r="43" class="fill-white" />

  <g class="-rotate-90" style="transform-origin: center;">
    <path d={secondCirclePath} class="fill-blue-600 opacity-10" />
    <path d={firstCirclePath} class="fill-blue-600" />
  </g>

  <circle cx="50" cy="50" r="43" class="fill-none stroke-[5] stroke-blue-200" />

  <text x="50" y="50" text-anchor="middle" dy="0.35em">
    {currentTurnDelta}
  </text>
</svg>
