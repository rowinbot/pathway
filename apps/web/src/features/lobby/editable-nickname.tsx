/** @jsxImportSource solid-js */

import { debounce } from "@/utils/misc";
import { updatePlayerInfo } from "@/utils/services/player.service";
import { createEffect, createSignal } from "solid-js";
import { notifications } from "@/features/notifications/notifications";

interface UpdateNicknameFormProps {
  nickname: string;
  submitting: boolean;
  onUpdate: (nickname: string) => void;
}
export default function EditableNickname(props: UpdateNicknameFormProps) {
  const [localNickname, setLocalNickname] = createSignal(props.nickname);

  const updateNickname = debounce(async (nickname: string) => {
    await updatePlayerInfo({ nickname });
    props.onUpdate(nickname);
    notifications.info("Nickname updated to " + nickname);
  }, 500);

  function onChange(e: InputEvent) {
    const input = (e.currentTarget || e.target) as HTMLInputElement;

    setLocalNickname(input.value);
    if (input.checkValidity()) updateNickname(input.value);
  }

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = (e.currentTarget || e.target) as HTMLFormElement;
    // check is form is valid

    const item = form.elements.namedItem("nickname");

    if (
      item instanceof HTMLInputElement &&
      item.name === "nickname" &&
      item.reportValidity()
    ) {
      updateNickname(item.value);
    }
  }

  createEffect(() => {
    setLocalNickname(props.nickname);
  });

  return (
    <form class="inline-flex flex-wrap gap-2" onSubmit={onSubmit}>
      <input
        aria-label="Nickname"
        value={props.nickname}
        onInput={onChange}
        type="text"
        required
        pattern="[a-zA-Z0-9_]+"
        minLength={3}
        maxLength={15}
        name="nickname"
        class="rounded-lg px-4 text-base py-2 w-64 outline-none ring-1 focus:ring-2 focus-visible:ring-2 focus-visible:ring-blue-600"
        classList={{
          "ring-green-600": props.nickname === localNickname(),
          "ring-yellow-600": props.nickname !== localNickname(),
        }}
      />

      <button
        type="submit"
        disabled={props.submitting}
        class="px-4 py-2 text-base bg-blue-800 border-[1px] border-blue-800 text-white rounded-lg uppercase disabled:opacity-50"
      >
        Update nickname
      </button>
    </form>
  );
}
