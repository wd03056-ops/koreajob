import { JobCard } from "../components/JobCard";
import type { Job } from "../data/jobs";

type FavoritesPageProps = {
  jobs: Job[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
};

export function FavoritesPage({ jobs, savedIds, onToggleSave }: FavoritesPageProps) {
  const savedJobs = jobs.filter((job) => savedIds.includes(job.id));

  return (
    <div className="px-5 pt-6">
      <h1 className="text-[24px] font-bold tracking-tight text-ink">찜한 일자리</h1>
      <p className="mt-1 text-[15px] text-muted">관심 있는 공고를 모아봤어요.</p>

      <div className="mt-5 flex flex-col gap-2.5">
        {savedJobs.length === 0 ? (
          <div className="rounded-2xl bg-white px-5 py-14 text-center">
            <p className="text-[16px] font-bold text-ink">아직 찜한 일자리가 없어요</p>
            <p className="mt-1 text-[14px] text-muted">홈에서 하트를 눌러 저장해 보세요.</p>
          </div>
        ) : (
          savedJobs.map((job) => (
            <JobCard key={job.id} job={job} saved onToggleSave={onToggleSave} />
          ))
        )}
      </div>
    </div>
  );
}
