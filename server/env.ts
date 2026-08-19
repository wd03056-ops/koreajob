import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(projectRoot, "..");

const envFiles = [
  path.resolve(workspaceRoot, ".env.local"),
  path.resolve(projectRoot, ".env.local"),
  path.resolve(process.cwd(), ".env.local"),
];

for (const envPath of envFiles) {
  const result = dotenv.config({ path: envPath, override: false });
  if (!result.error) {
    console.log("[jobaba] dotenv 로드:", envPath);
  }
}

export function getJobabaApiKey() {
  return process.env.JOBABA_API_KEY?.trim() ?? "";
}
