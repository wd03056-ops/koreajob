import { getJobabaApiKey } from "./env.ts";

export type JobabaJob = {
  title: string;
  organization: string;
  deadline: string;
  recruitStartDate: string;
  detailUrl: string;
  region: string;
};

export type JobabaQuery = {
  query?: string;
  page?: number;
  size?: number;
};

const JOBABA_API_URL = "https://adst.gg.go.kr/jobabaApi/v1.do";

const TITLE_KEYS = [
  "title",
  "pblancNm",
  "pblancSj",
  "PBLANC_NM",
  "PBLANC_SJ",
  "joSj",
  "JO_SJ",
  "jobNm",
  "recrutPblntNm",
  "wantedTitle",
  "empmnPblancNm",
  "공고명",
  "공고제목",
];

const ORG_KEYS = [
  "organization",
  "insttNm",
  "INSTT_NM",
  "companyNm",
  "COMPANY_NM",
  "entrprsNm",
  "ENTRPRS_NM",
  "cmpnyNm",
  "coNm",
  "CO_NM",
  "organNm",
  "corpNm",
  "기관명",
  "기업명",
];

const START_KEYS = [
  "recruitStartDate",
  "rceptBgnde",
  "RCEPT_BGNDE",
  "rceptBeginDe",
  "rcritPblntBgngDt",
  "receiptBeginDt",
  "startDt",
  "bgnde",
  "모집시작일",
  "접수시작일",
];

const END_KEYS = [
  "recruitEndDate",
  "rceptEndde",
  "RCEPT_ENDDE",
  "rceptEndDe",
  "rcritPblntEndDt",
  "receiptEndDt",
  "receiptCloseDt",
  "endDt",
  "closeDt",
  "endde",
  "모집종료일",
  "접수종료일",
  "마감일",
];

const URL_KEYS = [
  "detailUrl",
  "DETAIL_URL",
  "infoUrl",
  "INFO_URL",
  "wantedInfoUrl",
  "WANTED_INFO_URL",
  "jobUrl",
  "homepage",
  "HOMEPAGE",
  "pblancUrl",
  "PBLANC_URL",
  "mobileUrl",
  "상세페이지URL",
];

const REGION_KEYS = [
  "region",
  "areaNm",
  "AREA_NM",
  "AREA_STR",
  "areaStr",
  "workArea",
  "workRegion",
  "sggNm",
  "workPlace",
  "지역",
  "근무지역",
];

function pickByHint(record: Record<string, unknown>, hint: RegExp) {
  for (const [key, value] of Object.entries(record)) {
    if (hint.test(key) && value != null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function pick(record: Record<string, unknown>, keys: string[], hint?: RegExp) {
  for (const key of keys) {
    const value = record[key];
    if (value != null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  const lowered = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]),
  );

  for (const key of keys) {
    const value = lowered[key.toLowerCase()];
    if (value != null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return hint ? pickByHint(record, hint) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectRows(value: unknown, acc: Record<string, unknown>[] = []) {
  if (Array.isArray(value)) {
    if (value.every((item) => isRecord(item))) {
      const looksLikeJobs = value.some((item) =>
        Object.keys(item).some((key) =>
          [...TITLE_KEYS, ...ORG_KEYS, ...URL_KEYS, ...REGION_KEYS, ...END_KEYS].some(
            (candidate) => candidate.toLowerCase() === key.toLowerCase(),
          ),
        ),
      );

      if (looksLikeJobs || (acc.length === 0 && value.length > 0 && isRecord(value[0]))) {
        acc.push(...(value as Record<string, unknown>[]));
        return acc;
      }
    }

    for (const item of value) collectRows(item, acc);
    return acc;
  }

  if (isRecord(value)) {
    for (const nested of Object.values(value)) collectRows(nested, acc);
  }

  return acc;
}

function parseXmlItems(xml: string) {
  const blocks = [...xml.matchAll(/<(?:item|row)>([\s\S]*?)<\/(?:item|row)>/gi)];

  return blocks.map((block) => {
    const record: Record<string, unknown> = {};

    for (const tag of block[1].matchAll(
      /<([A-Za-z0-9_]+)>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/\1>/g,
    )) {
      record[tag[1]] = (tag[2] ?? tag[3] ?? "").trim();
    }

    return record;
  });
}

function mapJobs(rows: Record<string, unknown>[]): JobabaJob[] {
  return rows
    .map((row) => ({
      title: pick(row, TITLE_KEYS, /title|pblanc|sj|공고|제목|jobnm|jo_sj/i),
      organization: pick(
        row,
        ORG_KEYS,
        /instt|company|entrpr|organ|corp|기업|기관|conm|co_nm|cmpny/i,
      ),
      deadline: pick(row, END_KEYS, /end|close|deadline|마감|종료|endde/i),
      recruitStartDate: pick(row, START_KEYS, /start|begin|bgnde|시작/i),
      detailUrl: pick(row, URL_KEYS, /url|link|homepage/i),
      region: pick(row, REGION_KEYS, /region|area|sgg|지역|place/i),
    }))
    .filter((job) => job.title || job.organization);
}

export async function fetchJobabaJobs(query: JobabaQuery = {}): Promise<{
  data: unknown;
  jobs: JobabaJob[];
}> {
  const apiKey = getJobabaApiKey();

  if (!apiKey) {
    throw new Error("JOBABA_API_KEY가 설정되지 않았습니다. .env.local을 확인해 주세요.");
  }

  const url = new URL(JOBABA_API_URL);
  url.searchParams.set("authKey", apiKey);
  url.searchParams.set("type", "json");
  url.searchParams.set("pIndex", String(query.page ?? 1));
  url.searchParams.set("pSize", String(query.size ?? 20));

  if (query.query) {
    url.searchParams.set("query", query.query);
  }

  const redactedUrl = url.toString().replaceAll(apiKey, "***");
  console.log("[jobaba] 요청 URL:", redactedUrl);
  console.log("[jobaba] authKey 전달 여부:", url.searchParams.has("authKey"));
  console.log("[jobaba] process.env.JOBABA_API_KEY 길이:", apiKey.length);

  const response = await fetch(url, {
    headers: { Accept: "application/json, application/xml, text/xml, */*" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`잡아바 API 요청에 실패했습니다. (${response.status})`);
  }

  const raw = await response.text();
  const trimmed = raw.trim();

  if (trimmed.startsWith("<")) {
    return { data: trimmed, jobs: mapJobs(parseXmlItems(trimmed)) };
  }

  try {
    const data: unknown = JSON.parse(trimmed);
    return { data, jobs: mapJobs(collectRows(data)) };
  } catch {
    console.log("잡아바 API 원본 데이터:", trimmed);
    throw new Error("잡아바 API 응답을 파싱하지 못했습니다.");
  }
}
