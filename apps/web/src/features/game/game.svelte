<script lang="ts">
  import { loadPlayer } from "../../utils/services/player.service";
  import { type Socket, io } from "socket.io-client";
  import { onMount } from "svelte";
  import {
    type BoardState,
    type Player,
    type MatchConfig,
    type MatchPlayer,
    type MatchPlayerHand,
    type MatchCurrentTurn,
    buildBoard,
    MatchJoinStatus,
    CardNumber,
  } from "game-logic";
  import {
    type ClientToServerEvents,
    type ServerToClientEvents,
    ServerToClientEvent,
    ClientToServerEvent,
  } from "game-logic/realtime";
  import Started from "./started/started.svelte";
  import Entrance from "./entrance/entrance.svelte";
  import { getMatchTeamName } from "../../utils/match-team";

  export let gameId: string;

  let boardState: BoardState = buildBoard();
  let joinStatus: MatchJoinStatus | null = null;

  let player: Player;

  let matchPlayers: MatchPlayer[] = [];
  let matchStarted: boolean = false;
  let matchCurrentTurn: MatchCurrentTurn | null = null;
  let matchConfig: MatchConfig | null = null;
  let playerHand: MatchPlayerHand;

  $: currentMatchPlayer = findMatchPlayerById(player?.id, matchPlayers);

  $: matchCurrentTurnPlayer = findMatchPlayerById(
    matchCurrentTurn?.turnPlayerId,
    matchPlayers
  );

  let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  onMount(async () => {
    player = await loadPlayer();

    try {
      socket = io(import.meta.env.PUBLIC_SERVER_SOCKET_URL, {
        autoConnect: false,
        extraHeaders: {
          "x-player-id": player.id,
          "x-match-code": gameId,
        },
      });

      socket.on("disconnect", () => {
        // TODO: Handle disconnect
      });

      socket.on(ServerToClientEvent.MATCH_JOIN, (status) => {
        joinStatus = status;
        if (status !== MatchJoinStatus.SUCCESS) {
          alert("Failed to join match: " + status);
          goBackHome();
        }
      });

      socket.on(ServerToClientEvent.MATCH_STATE, (state, hand, currentTurn) => {
        // If we get the board, match already started
        matchStarted = true;
        boardState = state;
        matchCurrentTurn = currentTurn;
        playerHand = hand;
      });

      socket.on(ServerToClientEvent.MATCH_CONFIG_UPDATED, (config) => {
        matchConfig = config;
      });

      socket.on(ServerToClientEvent.MATCH_PLAYERS_UPDATED, (players) => {
        matchPlayers = players;
      });

      socket.on(ServerToClientEvent.TURN_TIMEOUT, (currentTurn) => {
        matchCurrentTurn = currentTurn;
      });

      socket.on(
        ServerToClientEvent.PLAYER_MOVEMENT,
        (movement, currentTurn) => {
          const { card, col, row, team } = movement;

          boardState[row][col] =
            card.number === CardNumber.SingleJack ? null : team;
          matchCurrentTurn = currentTurn;
        }
      );

      socket.on(ServerToClientEvent.MATCH_FINISHED, (winner) => {
        if (winner) {
          alert("Winner: " + getMatchTeamName(winner));
        } else {
          alert("Match is a draw");
        }
        goBackHome();
      });

      socket.connect();
    } catch (err) {
      console.log(err);
    }
  });

  function placeCard(event: CustomEvent<{ row: number; col: number }>) {
    socket.emit(
      ClientToServerEvent.MOVEMENT,
      {
        playerId: player.id,
        col: event.detail.col,
        row: event.detail.row,
      },
      (movementResult) => {
        if (movementResult.success && movementResult.card) {
          playerHand.cards = playerHand.cards.filter(
            (card) => card.id !== movementResult.card!.id
          );

          if (movementResult.nextCard) {
            playerHand.cards.push(movementResult.nextCard);
          }
        }
      }
    );
  }

  function goBackHome() {
    window.location.assign("/game");
  }

  function findMatchPlayerById(
    id: string | null | undefined,
    players: MatchPlayer[]
  ): MatchPlayer | null {
    if (id === null || id === undefined) return null;
    return players.find((player) => player.id === id) ?? null;
  }

  // 🛎️ Event handlers below 👇

  function startGame() {
    socket.emit(ClientToServerEvent.START_GAME, (didStart, reason) => {
      matchStarted = didStart;

      if (!didStart && reason) {
        alert("Couldn't start match due to: " + reason);
      }
    });
  }

  function copyMatchCode() {
    try {
      navigator.clipboard.writeText(window.location.host + "/game/" + gameId);
    } catch (err) {
      console.log(err);
    }
  }
</script>

<main class="pb-8 flex flex-col">
  <div class="border-b-[1px] border-blue-300 py-2 bg-blue-50">
    <p class="text-slate-900 max-w-7xl w-full mx-auto px-8">
      <span class="text-blue-700">@{player?.nickname ?? "..."}</span>
    </p>
  </div>

  <div class="pt-8 max-w-7xl w-full px-8 mx-auto">
    <section class="space-y-4">
      <header class="space-y-2">
        <h1 class="font-base text-5xl">Game</h1>

        <p class="text-2xl font-light">
          Match

          <span
            role="button"
            class="text-slate-500 select-all cursor-pointer"
            tabindex="0"
            on:click={copyMatchCode}
            on:keydown={copyMatchCode}>{gameId}</span
          >
        </p>
      </header>

      {#if joinStatus === MatchJoinStatus.SUCCESS && matchConfig}
        {#if matchStarted}
          <Started
            {boardState}
            {matchConfig}
            {currentMatchPlayer}
            {matchCurrentTurnPlayer}
            {matchCurrentTurn}
            {playerHand}
            on:pick-card={placeCard}
          />
        {:else}
          <Entrance
            {currentMatchPlayer}
            {matchPlayers}
            on:start-game={startGame}
          />
        {/if}
      {/if}
    </section>
  </div>
</main>
