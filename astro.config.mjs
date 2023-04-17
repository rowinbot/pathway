import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import lit from "@astrojs/lit";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), lit(), svelte()]
});