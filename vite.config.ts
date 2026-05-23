// Explicit Vite config for Vercel (Nitro adapter) deployment.
// Replaces @lovable.dev/vite-tanstack-config which uses Cloudflare by default.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
});
