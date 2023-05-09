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
    getMatchTeamName,
  } from "game-logic";
  import {
    type ClientToServerEvents,
    type ServerToClientEvents,
    ServerToClientEvent,
    ClientToServerEvent,
  } from "game-logic/realtime";
  import Started from "./started/started.svelte";
  import Entrance from "./entrance/entrance.svelte";

  export let gameId: string;

  let boardState: BoardState = buildBoard();
  let joinStatus: MatchJoinStatus | null = null;

  let player: Player;

  let matchPlayers: MatchPlayer[] = [];
  let matchStarted: boolean = false;
  let matchCurrentTurn: MatchCurrentTurn | null = null;
  let matchConfig: MatchConfig | null = null;
  let playerHand: MatchPlayerHand;

  $: matchCurrentTurnPlayer = matchCurrentTurn
    ? findPlayerById(matchCurrentTurn.turnPlayerId)
    : null;

  let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  function goBackHome() {
    window.location.assign("/game");
  }

  function findPlayerById(id: string): MatchPlayer | null {
    return matchPlayers.find((player) => player.id === id) ?? null;
  }

  onMount(async () => {
    player = await loadPlayer();

    try {
      socket = io("ws://localhost:" + 3001, {
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

  function startGame() {
    socket.emit(ClientToServerEvent.START_GAME, (didStart) => {
      matchStarted = didStart;
    });
  }
</script>

<section class="space-y-4">
  <header>
    <h1 class="font-base text-5xl">Pathway</h1>
  </header>

  {#if joinStatus === MatchJoinStatus.SUCCESS && matchConfig}
    {#if matchStarted}
      <Started
        {boardState}
        {matchConfig}
        {matchCurrentTurnPlayer}
        {matchCurrentTurn}
        {playerHand}
        on:place-card={placeCard}
      />
    {:else}
      <Entrance {matchPlayers} on:start-game={startGame} />
    {/if}
  {/if}
</section>
