<script lang="ts">
  import { loadPlayer } from "@/utils/services/player.service";
  import { type Socket, io } from "socket.io-client";
  import { onMount } from "svelte";
  import type {
    BoardState,
    Player,
    MatchConfig,
    MatchPlayer,
    MatchPlayerHand,
    MatchCurrentTurn,
    Card as CardObject,
    TeamI,
    BoardPosition,
    PartyNewMatchMode,
  } from "game-logic";

  import {
    PartyJoinStatus,
    updateBoardStateFromNewSequences,
    buildBoard,
    CardNumber,
    cardNumber,
  } from "game-logic";
  import {
    type ClientToServerEvents,
    type ServerToClientEvents,
    ServerToClientEvent,
    ClientToServerEvent,
  } from "game-logic/realtime";
  import Started from "./started/started.svelte";
  import Entrance from "./entrance/entrance.svelte";
  import { getMatchTeamName } from "@/utils/match-team";
  import { notifications } from "@/features/notifications/notifications";
  import { matchCouldNotStartReasonText } from "@/utils/strings";

  export let gameId: string;

  let boardState: BoardState = buildBoard();
  let joinStatus: PartyJoinStatus | null = null;

  let player: Player;

  let matchPlayers: MatchPlayer[] = [];
  let matchWinner: TeamI | null = null;
  let matchStarted: boolean = false;
  let matchCurrentTurn: MatchCurrentTurn | null = null;
  let matchConfig: MatchConfig | null = null;
  let playerHand: MatchPlayerHand | null = null;

  let lastPlayedCard: CardObject | null = null;

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
          "x-party-code": gameId,
        },
      });

      socket.on("disconnect", () => {
        // TODO: Handle disconnect
      });

      socket.on(ServerToClientEvent.PARTY_JOIN, (status) => {
        console.log("PARTY_JOIN", status);
        joinStatus = status;
        if (status !== PartyJoinStatus.SUCCESS) {
          alert("Failed to join match: " + status);
          goBackHome();
        }
      });

      socket.on(ServerToClientEvent.PARTY_CONFIG_UPDATED, (config) => {
        console.log("PARTY_CONFIG_UPDATED", config);
        matchConfig = config;
      });

      socket.on(ServerToClientEvent.PARTY_PLAYERS_UPDATED, (players) => {
        console.log("PARTY_PLAYERS_UPDATED", players);
        matchPlayers = players;
      });

      socket.on(
        ServerToClientEvent.PARTY_STATE,
        (state, hand, currentTurn, winner) => {
          console.log("PARTY_STATE", state, hand, currentTurn);
          // If we get the board, match already started
          matchStarted = true;
          matchWinner = winner;
          boardState = state;
          if (winner === null) {
            matchCurrentTurn = currentTurn;
          }
          playerHand = hand;

          emitTurnNotification(currentTurn.turnPlayerId);
          notifications.send(
            currentMatchPlayer
              ? "You are playing with the " +
                  getMatchTeamName(currentMatchPlayer.team)
              : "You are playing as @" + player.nickname
          );
        }
      );

      socket.on(ServerToClientEvent.TURN_TIMEOUT, (currentTurn) => {
        console.log("TURN_TIMEOUT", currentTurn);
        const lastTurnPlayer = findMatchPlayerById(
          currentTurn.turnPlayerId,
          matchPlayers
        )!;

        const wasYourTurn = lastTurnPlayer.id === currentMatchPlayer?.id;

        if (wasYourTurn) {
          notifications.danger("Your turn timed out");
        } else {
          notifications.warning(
            'Turn timed out for "' +
              lastTurnPlayer.nickname +
              '" (' +
              getMatchTeamName(lastTurnPlayer.team) +
              ")"
          );
        }

        matchCurrentTurn = currentTurn;
      });

      socket.on(
        ServerToClientEvent.PLAYER_MOVEMENT,
        (movement, currentTurn) => {
          console.log("PLAYER_MOVEMENT", movement, currentTurn);
          const { card, col, row, newSequences, team } = movement;

          lastPlayedCard = card;

          const createdNewSequences = newSequences.length > 0;

          boardState[row][col] = {
            team: cardNumber(card) === CardNumber.SingleJack ? null : team,
            isPartOfASequence: createdNewSequences,
          };

          if (createdNewSequences)
            updateBoardStateFromNewSequences(boardState, newSequences);
          matchCurrentTurn = currentTurn;
          emitTurnNotification(currentTurn.turnPlayerId);
        }
      );

      socket.on(ServerToClientEvent.MATCH_FINISHED, (winner) => {
        console.log("MATCH_FINISHED", winner);
        const matchFinishedTimeout = 10000;

        if (winner !== null) {
          const winnerTeamName = getMatchTeamName(winner);

          notifications.info(
            winner === currentMatchPlayer?.team
              ? "You won the match! " + winnerTeamName
              : "Winner: " + winnerTeamName,
            matchFinishedTimeout
          );
        } else {
          notifications.info("Match is a draw", matchFinishedTimeout);
        }

        matchWinner = winner;
        matchCurrentTurn = null;
      });

      socket.on(ServerToClientEvent.PARTY_NEW_MATCH, (mode) => {
        console.log(mode);
        matchStarted = false;
        matchWinner = null;
      });

      socket.connect();
    } catch (err) {
      console.log(err);
    }
  });

  function emitTurnNotification(currentTurnPlayerId: string) {
    const matchCurrentTurnPlayer = findMatchPlayerById(
      currentTurnPlayerId,
      matchPlayers
    )!;
    const isYourTurn = matchCurrentTurnPlayer?.id === player.id;

    if (matchCurrentTurnPlayer) {
      if (isYourTurn) {
        notifications.info("Your turn");
      } else {
        notifications.send(
          `${matchCurrentTurnPlayer.nickname} (${getMatchTeamName(
            matchCurrentTurnPlayer.team
          )}) turn`
        );
      }
    }
  }

  function doMovement(event: CustomEvent<BoardPosition>) {
    socket.emit(
      ClientToServerEvent.MOVEMENT,
      {
        playerId: player.id,
        col: event.detail.col,
        row: event.detail.row,
      },
      (movementResult) => {
        if (!playerHand) throw new Error("playerHand is null");
        if (movementResult.success && movementResult.card) {
          playerHand.cards = playerHand.cards.filter(
            (card) => card.uid !== movementResult.card!.uid
          );
        }

        if (movementResult.nextCard) {
          playerHand.cards.push(movementResult.nextCard);
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

  function startNewGame(e: CustomEvent<{ mode: PartyNewMatchMode }>) {
    console.log(e.detail);
    socket.emit(
      ClientToServerEvent.NEW_MATCH,
      e.detail.mode,
      (start, reason) => {
        console.log(start, reason);
        notifications.danger("Starting new match with mode " + e.detail.mode);
      }
    );
  }

  function startGame() {
    socket.emit(ClientToServerEvent.START_GAME, (didStart, reason) => {
      matchStarted = didStart;

      if (!didStart && reason) {
        notifications.danger(
          "Couldn't start match due to: " + matchCouldNotStartReasonText[reason]
        );
      }
    });
  }

  function copyMatchCode() {
    const linkToMatch =
      window.location.protocol +
      "//" +
      window.location.host +
      "/game/" +
      gameId;

    try {
      navigator.clipboard.writeText(linkToMatch);
      notifications.send("Copied match link to clipboard: " + linkToMatch);
    } catch (err) {
      console.log(err);

      notifications.info(
        "Couldn't copy match link to clipboard: " + linkToMatch,
        10000
      );
    }
  }

  function movePlayerToTeam(e: CustomEvent<{ playerId: string; team: TeamI }>) {
    socket.emit(
      ClientToServerEvent.MOVE_PLAYER_TO_TEAM,
      e.detail.playerId,
      e.detail.team
    );
  }

  // $: {
  //   console.log({
  //     boardState,
  //     playerHand,
  //     currentMatchPlayer,
  //     matchCurrentTurn,
  //     matchCurrentTurnPlayer,
  //     matchPlayers,
  //     matchConfig,
  //     lastPlayedCard,
  //     matchStarted,
  //   });
  // }
</script>

<main class="pb-8 flex flex-col">
  <div class="border-b-[1px] border-blue-300 py-2 bg-blue-50">
    <p class="text-slate-900 max-w-5xl px-2 w-full mx-auto">
      <span class="text-blue-700">@{player?.nickname ?? "..."}</span>
    </p>
  </div>

  <div class="pt-8 w-full mx-auto">
    <section class="space-y-4">
      <header class="space-y-2 max-w-5xl px-2 mx-auto">
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

      {#if joinStatus === PartyJoinStatus.SUCCESS && matchConfig}
        {#if matchStarted}
          <Started
            {boardState}
            {matchConfig}
            {currentMatchPlayer}
            {matchPlayers}
            {matchWinner}
            {matchCurrentTurnPlayer}
            {matchCurrentTurn}
            {playerHand}
            {lastPlayedCard}
            on:pick-card={doMovement}
            on:start-new-game={startNewGame}
          />
        {:else}
          <Entrance
            {currentMatchPlayer}
            {matchPlayers}
            on:start-game={startGame}
            on:drop-player-to-team={movePlayerToTeam}
          />
        {/if}
      {/if}
    </section>
  </div>
</main>
