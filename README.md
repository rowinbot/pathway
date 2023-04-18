# Pathway Game

This is the Pathway game a spin-off of the Sequence game, written in Astro mainly (The Glue®) with the logic components behind the game written in Svelte and the lobby components written in Solid.

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
