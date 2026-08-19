import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import aitDevtools from "@apps-in-toss/devtools/unplugin";
import { jobabaApiPlugin } from "./plugins/jobaba-api.ts";
import { getJobabaApiKey } from "./server/env.ts";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const envDir = path.resolve(rootDir, "..");

export default defineConfig(() => {
  const apiKey = getJobabaApiKey();
  console.log(
    "[jobaba] process.env.JOBABA_API_KEY:",
    apiKey ? `로드됨 (${apiKey.length}자)` : "없음",
  );

  return {
    envDir,
    plugins: [
      jobabaApiPlugin(),
      aitDevtools.vite(),
      tailwindcss(),
      react(),
    ],
  };
});