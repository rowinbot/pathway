/** @jsxImportSource solid-js */

export default function Lobby() {
  return (
    <form>
      <div>
        <label for="name">Name</label>
        <input type="text" name="name" id="name" />
      </div>

      <div>
        <label for="email">Email</label>
        <input type="email" name="email" id="email" />
      </div>
    </form>
  );
}
