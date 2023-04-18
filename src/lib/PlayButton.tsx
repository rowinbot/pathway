/** @jsxImportSource solid-js */

export default function PlayButton(props: { title: string }) {
  const onClick = () => {
    const testGameId = 123;
    window.location.assign("/game/" + testGameId);
  };

  return (
    <button class="text-xl bg-black px-4 py-2 text-white" onClick={onClick}>
      {props.title}
    </button>
  );
}
