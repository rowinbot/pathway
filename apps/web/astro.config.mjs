import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import solidJs from "@astrojs/solid-js";

import node from "@astrojs/node";
import autoprefixer from "autoprefixer";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), solidJs()],
  output: "server",
  adapter: node({
    mode: "middleware",
  }),
});
