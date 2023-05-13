import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import solidJs from "@astrojs/solid-js";

import node from "@astrojs/node";
import autoprefixer from "autoprefixer";

const DEFAULT_PORT = 3000;

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), solidJs()],
  output: "server",
  adapter: node({
    mode: "middleware",
  }),
  server: {
    port:
      parseInt(process.env.WEB_PORT || `${DEFAULT_PORT}`, 10) || DEFAULT_PORT,
  },
});
