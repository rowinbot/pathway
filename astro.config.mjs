import { defineConfig } from "astro/config";
import lit from "@astrojs/lit";
import svelte from "@astrojs/svelte";
import solidJs from "@astrojs/solid-js";

import node from "@astrojs/node";
import autoprefixer from "autoprefixer";

// https://astro.build/config
export default defineConfig({
  integrations: [lit(), svelte(), solidJs()],
  output: "server",
  adapter: node({
    mode: "middleware",
  }),
});
