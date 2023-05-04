import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import lit from "@astrojs/lit";
import svelte from "@astrojs/svelte";
import solidJs from "@astrojs/solid-js";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), lit(), svelte(), solidJs()],
  output: "server",
  adapter: node({
    mode: "standalone"
  })
});