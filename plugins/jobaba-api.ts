import type { Plugin } from "vite";
import { handleJobsRequest } from "../server/jobs-route.ts";

export function jobabaApiPlugin(): Plugin {
  return {
    name: "jobaba-api",
    configureServer(server) {
      server.middlewares.use("/api/jobs", (req, res) => {
        void handleJobsRequest(req, res);
      });
    },
  };
}
