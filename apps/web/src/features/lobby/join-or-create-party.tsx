/** @jsxImportSource solid-js */

import { createInputMask, maskArrayToFn } from "@solid-primitives/input-mask";
import { Show, createSignal } from "solid-js";
import { createParty, joinParty } from "@/utils/services/party.service";
import { Party, Player } from "game-logic";
import { PartyJoinStatus } from "game-logic";
import { notifications } from "@/features/notifications/notifications";

const CODE_LENGTH = 6;

interface JoinOrCreatePartyProps {
  player: Player | null;
  onPartyCreated: (party: Party) => void;
  onPartyJoined: (party: Party) => void;
}
export function JoinOrCreateParty(props: JoinOrCreatePartyProps) {
  const [code, setCode] = createSignal("");

  const codeMask = maskArrayToFn(["P", "-", /[0-9a-zA-Z]{0,4}/i]);
  const codeHandler = createInputMask((v, selection) => {
    const value = codeMask(v.toLocaleUpperCase(), selection);
    setCode(value[0]);

    return value;
  });

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const joiningCode = code();

    if (joiningCode.length < CODE_LENGTH) {
      const party = await createParty();

      if (!party) {
        notifications.warning("Could not create party");
        return;
      }

      props.onPartyCreated(party);
    } else {
      const { party, partyJoinStatus } = await joinParty(joiningCode);

      if (partyJoinStatus !== PartyJoinStatus.SUCCESS) {
        // NOTE: Improve error messaging
        notifications.warning(
          "Could not join party with error: " + partyJoinStatus
        );
        return;
      }

      props.onPartyJoined(party);
    }
  };

  return (
    <form class="space-y-2" onSubmit={onSubmit}>
      <div class="flex flex-col space-y-2">
        <label for="partyCode">Party Code</label>
        <input
          type="text"
          name="partyCode"
          class="bg-white border-[1px] rounded-lg px-4 py-2"
          placeholder="P-XXXX"
          onInput={codeHandler}
          onPaste={codeHandler}
        />
      </div>

      <Show
        when={code().length > 0}
        fallback={
          <button
            class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
            type="submit"
          >
            Create Game
          </button>
        }
      >
        <button
          class="px-4 py-2 text-base bg-blue-800 border-[1px] border-blue-800 text-white rounded-lg uppercase disabled:opacity-50"
          disabled={code().length < CODE_LENGTH}
          type="submit"
        >
          Join Game
        </button>
      </Show>
    </form>
  );
}
