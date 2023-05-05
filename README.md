# The Pathway Game

> POSTMORTEM: The idea to try-out Astro along with Svelte and Nest with a monorepo was a Solid one (pun intended) but turns out Nest.js doesn't support ESM modules in a simple way, one would've to do too many tricks to make it work they way I wanted. So I've decided to go with Next.js (App Router) and test it out.

This is The Pathway Game (a spin-off of Sequence), written in Astro mainly (The Glue®) with the logic components behind the game written in Svelte and the lobby components written in Solid.

## 🙋‍♀️ Why three frameworks?

Just because. Good timing and good technologies. Can they really work **well** together? I'm set to figure it out!

## 🚀 Project Structure

```plaintext
/
├── public/
│   ├── Public files
├── src/
│   ├── game/
│   │   └── Game files (Svelte)
│   ├── lobby/
│   │   └── Lobby files (Solid)
│   └── pages/
│       └── Routes, entry points (Astro)
├── layouts/
    └── Layouts for the routes (Astro)
```

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [Astro's documentation](https://docs.astro.build).