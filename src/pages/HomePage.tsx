import { useEffect, useMemo, useState } from "react";
import type { CategoryId } from "../components/CategoryGrid";
import { CategoryGrid } from "../components/CategoryGrid";
import { ChevronIcon } from "../components/Icons";
import { Header } from "../components/Header";
import { JobCard } from "../components/JobCard";
import { SearchBar } from "../components/SearchBar";
import type { Job } from "../data/jobs";
import { getDday } from "../data/jobs";
import { fetchJobs } from "../lib/jobs-api";

type HomePageProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: CategoryId | null;
  onCategoryChange: (id: CategoryId) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onJobsLoaded?: (jobs: Job[]) => void;
  onNotify: () => void;
};

function UrgentSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-w-[232px] animate-pulse rounded-2xl bg-white p-4"
        >
          <div className="h-5 w-14 rounded-full bg-canvas" />
          <div className="mt-4 h-3 w-20 rounded bg-canvas" />
          <div className="mt-2 h-5 w-40 rounded bg-canvas" />
          <div className="mt-4 h-3 w-24 rounded bg-canvas" />
        </div>
      ))}
    </>
  );
}

export function HomePage({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  savedIds,
  onToggleSave,
  onJobsLoaded,
  onNotify,
}: HomePageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);

      fetchJobs(query)
        .then((nextJobs) => {
          if (cancelled) return;
          setJobs(nextJobs);
          setError(null);
          onJobsLoaded?.(nextJobs);
        })
        .catch((nextError: unknown) => {
          if (cancelled) return;
          setJobs([]);
          onJobsLoaded?.([]);
          setError(
            nextError instanceof Error ? nextError.message : "공고를 불러오지 못했습니다.",
          );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, query.trim() ? 400 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, onJobsLoaded]);

  const filtered = useMemo(() => {
    if (category == null) return jobs;
    return jobs.filter((job) =>
      `${job.title} ${job.organization} ${job.region}`.includes(category),
    );
  }, [jobs, category]);

  const urgent = useMemo(() => {
    return filtered
      .map((job) => ({ job, dday: getDday(job.deadline) }))
      .filter((item) => item.dday.days != null && item.dday.days >= 0)
      .sort((a, b) => (a.dday.days ?? 0) - (b.dday.days ?? 0))
      .slice(0, 8)
      .map((item) => item.job);
  }, [filtered]);

  return (
    <div>
      <Header onNotify={onNotify} />
      <SearchBar value={query} onChange={onQueryChange} />
      <CategoryGrid selected={category} onSelect={onCategoryChange} />

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between px-5">
          <h2 className="text-[17px] font-bold text-ink">마감 임박</h2>
          <span className="flex items-center text-[13px] font-medium text-muted">
            {loading ? "불러오는 중" : `${urgent.length}건`}
            <ChevronIcon className="h-4 w-4" />
          </span>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {loading ? (
            <UrgentSkeleton />
          ) : error ? (
            <p className="py-8 text-[14px] text-danger">{error}</p>
          ) : urgent.length === 0 ? (
            <p className="py-8 text-[14px] text-muted">마감 임박 공고가 없어요.</p>
          ) : (
            urgent.map((job) => <JobCard key={job.id} job={job} variant="horizontal" />)
          )}
        </div>
      </section>

      <section className="mt-7 px-5 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-ink">추천 공고</h2>
          <span className="text-[13px] font-medium text-muted">잡아바 실시간</span>
        </div>
        {error ? (
          <p className="rounded-2xl bg-white py-10 text-center text-[14px] text-danger">
            {error}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {loading && (
              <p className="rounded-2xl bg-white py-10 text-center text-[14px] text-muted">
                공고를 불러오는 중이에요.
              </p>
            )}
            {!loading &&
              filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={savedIds.includes(job.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            {!loading && filtered.length === 0 && (
              <p className="rounded-2xl bg-white py-10 text-center text-[14px] text-muted">
                조건에 맞는 공고가 없어요.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
