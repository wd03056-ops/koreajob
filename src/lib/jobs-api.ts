import type { Job } from "../data/jobs";
import { normalizeDate } from "../data/jobs";

type JobabaJob = {
  title: string;
  organization: string;
  deadline: string;
  detailUrl: string;
  region: string;
};

export async function fetchJobs(query = ""): Promise<Job[]> {
  const params = new URLSearchParams({
    page: "1",
    size: "30",
  });

  if (query.trim()) {
    params.set("query", query.trim());
  }

  const response = await fetch(`/api/jobs?${params.toString()}`);
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "공고를 불러오지 못했습니다.";
    throw new Error(message);
  }

  if (!Array.isArray(payload)) {
    throw new Error("공고 응답 형식이 올바르지 않습니다.");
  }

  return (payload as JobabaJob[]).map((item, index) => ({
    id: item.detailUrl || `${item.organization}-${item.title}-${index}`,
    organization: item.organization,
    title: item.title,
    region: item.region,
    deadline: normalizeDate(item.deadline),
    detailUrl: item.detailUrl,
  }));
}
