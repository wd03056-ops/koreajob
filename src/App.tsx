import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

type Job = {
  id: string;
  [key: string]: unknown;
};

function pick(job: Job, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = job[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function getTitle(job: Job) {
  return pick(job, ["PBLANC_TITLE", "PBANC_NM", "JOB_NM", "TITLE"], "공고 제목 없음");
}

function getOrganization(job: Job) {
  return pick(job, ["INST_NM", "ENTRPRS_NM", "WKPLC_NM"], "기관 정보 없음");
}

function getDeadline(job: Job) {
  return pick(job, ["RECRUIT_END_DE", "RCEPT_CLOS_DE"], "상시 채용");
}

function getDetailUrl(job: Job) {
  return pick(job, ["DETAIL_PAGE_URL", "detailUrl", "INFO_URL"]);
}

const GYEONGGI_REGIONS = [
  "수원시",
  "고양시",
  "용인시",
  "성남시",
  "부천시",
  "화성시",
  "안산시",
  "남양주시",
  "안양시",
  "평택시",
  "의정부시",
  "시흥시",
  "파주시",
  "김포시",
  "광명시",
  "군포시",
  "광주시",
  "이천시",
  "양주시",
  "오산시",
  "구리시",
  "안성시",
  "포천시",
  "의왕시",
  "하남시",
  "여주시",
  "양평군",
  "동두천시",
  "과천시",
  "가평군",
  "연천군",
] as const;

type RegionName = (typeof GYEONGGI_REGIONS)[number] | "기타";
type RegionFilter = "전체" | RegionName;

function getRegion(job: Job): RegionName {
  const raw = pick(job, [
    "SIGUN_NM",
    "AREA_NM",
    "JOB_AREA",
    "WORK_REGION",
    "REGION_NM",
    "WKPLC_REGION",
    "지역",
  ]);
  const haystack = `${raw} ${getOrganization(job)} ${getTitle(job)}`;

  const matched = GYEONGGI_REGIONS.find((region) => {
    const shortName = region.replace(/(시|군)$/, "");
    return haystack.includes(region) || haystack.includes(shortName);
  });

  return matched ?? "기타";
}

function normalizeDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return value;
}

function getDday(deadline: string) {
  if (!deadline || deadline === "상시 채용") {
    return { label: "상시", tone: "always" as const };
  }

  const normalized = normalizeDate(deadline);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { label: deadline, tone: "normal" as const };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${normalized}T00:00:00`);
  const days = Math.round((end.getTime() - today.getTime()) / 86_400_000);

  if (Number.isNaN(days)) return { label: deadline, tone: "normal" as const };
  if (days < 0) return { label: "마감", tone: "closed" as const };
  if (days === 0) return { label: "D-Day", tone: "urgent" as const };
  if (days <= 7) return { label: `D-${days}`, tone: "urgent" as const };
  return { label: `D-${days}`, tone: "normal" as const };
}

function formatDeadline(deadline: string) {
  if (!deadline || deadline === "상시 채용") return "상시 채용";
  const normalized = normalizeDate(deadline);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return deadline;
  return `${match[1]}.${match[2]}.${match[3]} 마감`;
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionFilter>("전체");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(jobList);
      } catch (error) {
        console.error("데이터를 불러오는 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of jobs) {
      const name = getRegion(job);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return counts;
  }, [jobs]);

  const regionOptions = useMemo(() => {
    const ordered: RegionFilter[] = GYEONGGI_REGIONS.filter(
      (name) => (regionCounts.get(name) ?? 0) > 0,
    );
    if ((regionCounts.get("기타") ?? 0) > 0) ordered.push("기타");
    return ["전체", ...ordered] as RegionFilter[];
  }, [regionCounts]);

  const filteredJobs = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const jobRegion = getRegion(job);
      const matchesRegion = region === "전체" || jobRegion === region;
      if (!matchesRegion) return false;
      if (!keyword) return true;

      const title = getTitle(job).toLowerCase();
      const organization = getOrganization(job).toLowerCase();
      return title.includes(keyword) || organization.includes(keyword) || jobRegion.includes(keyword);
    });
  }, [jobs, query, region]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">일자리 정보를 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">경기 공공일자리</p>
        <h1>나에게 맞는 일자리를 찾아보세요</h1>
        <p className="hero-copy">공고 제목이나 기관명으로 원하는 채용 정보를 바로 검색할 수 있어요.</p>

        <label className="search-bar">
          <span className="search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="공고 제목, 기관명 검색"
            aria-label="공고 제목 또는 기관명 검색"
          />
        </label>
      </header>

      <nav className="region-tabs" aria-label="지역별 카테고리">
        {regionOptions.map((name) => {
          const count = name === "전체" ? jobs.length : (regionCounts.get(name) ?? 0);
          const active = region === name;
          return (
            <button
              key={name}
              type="button"
              className={`region-chip${active ? " is-active" : ""}`}
              onClick={() => setRegion(name)}
            >
              {name}
              <span>{count}</span>
            </button>
          );
        })}
      </nav>

      <section className="toolbar">
        <h2>채용 공고</h2>
        <p>
          전체 <strong>{jobs.length}</strong>건 중 <strong>{filteredJobs.length}</strong>건
        </p>
      </section>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <strong>검색 결과가 없어요</strong>
          <p>다른 키워드로 다시 검색해 보세요.</p>
        </div>
      ) : (
        <div className="job-grid">
          {filteredJobs.map((job) => {
            const title = getTitle(job);
            const organization = getOrganization(job);
            const deadline = getDeadline(job);
            const dday = getDday(deadline);
            const detailUrl = getDetailUrl(job);
            const jobRegion = getRegion(job);

            return (
              <article key={job.id} className="job-card">
                <div className="job-card-top">
                  <p className="job-org">{organization}</p>
                  <span className={`deadline-badge tone-${dday.tone}`}>{dday.label}</span>
                </div>

                <h3 className="job-title">
                  {detailUrl ? (
                    <a href={detailUrl} target="_blank" rel="noopener noreferrer">
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h3>

                <div className="job-card-bottom">
                  <span className="job-region">{jobRegion}</span>
                  <span className="deadline-text">{formatDeadline(deadline)}</span>
                  {detailUrl ? (
                    <a className="job-link" href={detailUrl} target="_blank" rel="noopener noreferrer">
                      상세보기
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
