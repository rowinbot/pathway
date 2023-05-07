<script lang="ts">
  import Board from "./board.svelte";
  import { loadPlayer } from "../../utils/services/player.service";
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import { type BoardState, buildBoard } from "game-logic";

  export let gameId: string;

  const boardState: BoardState = buildBoard();

  onMount(() => {
    const player = loadPlayer().then((player) => {
      if (!player) return;

      try {
        const socket = io("ws://localhost:" + 3001, {
          autoConnect: false,
          extraHeaders: {
            "x-player-id": player.id,
            "x-match-code": gameId,
          },
        });

        socket.on("game:player-move", (payload) => {
          console.log("game:player-move", payload);
          const {
            action,
            move: { col, row },
          } = payload;

          boardState[row][col] = action === "add" ? true : false;
        });

        socket.connect();
      } catch (err) {
        console.log(err);
      }
    });
  });
</script>

<Board {boardState} />
