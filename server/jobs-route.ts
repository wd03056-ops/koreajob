import "./env.ts";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchJobabaJobs } from "./jobaba.ts";

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function handleJobsRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== "GET") {
    sendJson(res, 405, { error: "GET만 지원합니다." });
    return;
  }

  const requestUrl = new URL(req.url ?? "/", "http://localhost");

  try {
    const { data, jobs } = await fetchJobabaJobs({
      query: requestUrl.searchParams.get("query") ?? undefined,
      page: Number(requestUrl.searchParams.get("page") ?? 1),
      size: Number(requestUrl.searchParams.get("size") ?? 20),
    });

    console.log("잡아바 API 원본 데이터:", JSON.stringify(data, null, 2));
    if (jobs[0]) {
      console.log("프론트 매핑 샘플:", JSON.stringify(jobs[0], null, 2));
    } else {
      console.log("매핑된 공고가 없습니다. 원본 필드명을 확인해 주세요.");
    }

    sendJson(res, 200, jobs);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "일자리 정보를 불러오지 못했습니다.";
    sendJson(res, 500, { error: message });
  }
}
