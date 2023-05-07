import { defineConfig } from "tsup";

export default defineConfig({
  noExternal: ["game-logic"], // Mono-repo packages are esm, and server bundle is cjs, so we need to include these as mono-repo is not cjs'ing them.
});
