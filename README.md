# The Pathway Game

This is The Pathway Game (a spin-off of Sequence).

This is a Turbopack monorepo with the following structure (apps + packages):

```plaintext
/
├── apps/
│   ├── web/
│   │   └── The Front-End for the game, written in Astro (The Glue®) with the logic components behind the game written in Svelte and the lobby components written in Solid.
│   └── server/
│       └── The Back-End for the game, written in Node.js with Express and Socket.io.
├── packages/
│   ├── game-logic/
│   │   └── The logic components behind the game, written in Typescript.
│   └── tsconfig/
│       └── The shared Typescript configuration for the project.
```

## 🙋‍♀️ Why three frameworks for the Front-End?

Just because. Good timing and good technologies. Can they really work **well** together? I'm set to figure it out!

## 🚀 Front-End Structure

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

## 🍦 Back-End Structure

TBD

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                 | Action                                           |
| :---------------------- | :----------------------------------------------- |
| `pnpm install`          | Installs dependencies                            |
| `pnpm run dev`          | Starts local dev server for the apps             |
| `pnpm run build`        | Build the apps in production mode                |
| `pnpm run lint`         | Runs the linter for the apps                     |
