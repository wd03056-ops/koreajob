import type { Job } from "../data/jobs";
import { formatDeadline, getDday } from "../data/jobs";
import { HeartIcon } from "./Icons";

type JobCardProps = {
  job: Job;
  variant?: "horizontal" | "vertical";
  saved?: boolean;
  onToggleSave?: (id: string) => void;
};

export function JobCard({
  job,
  variant = "vertical",
  saved = false,
  onToggleSave,
}: JobCardProps) {
  const dday = getDday(job.deadline);

  if (variant === "horizontal") {
    return (
      <article className="min-w-[232px] rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${
              dday.urgent ? "bg-[#FFF0F0] text-danger" : "bg-canvas text-sub"
            }`}
          >
            {dday.label}
          </span>
          {job.region ? (
            <span className="text-[12px] font-medium text-muted">{job.region}</span>
          ) : null}
        </div>
        <p className="mt-3 text-[13px] font-medium text-muted">{job.organization}</p>
        <h3 className="mt-1 line-clamp-2 text-[16px] font-bold leading-snug text-ink">
          {job.title}
        </h3>
        <p className="mt-3 text-[13px] text-muted">{formatDeadline(job.deadline)}</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted">{job.organization}</p>
          <h3 className="mt-1 text-[16px] font-bold leading-snug text-ink">{job.title}</h3>
        </div>
        <button
          type="button"
          aria-label={saved ? "찜 해제" : "찜하기"}
          onClick={() => onToggleSave?.(job.id)}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            saved ? "text-danger" : "text-muted"
          }`}
        >
          <HeartIcon className="h-5 w-5" filled={saved} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${
            dday.urgent ? "bg-[#FFF0F0] text-danger" : "bg-canvas text-sub"
          }`}
        >
          {dday.label}
        </span>
        {job.region ? (
          <span className="rounded-full bg-canvas px-2 py-0.5 text-[12px] font-medium text-sub">
            {job.region}
          </span>
        ) : null}
        <span className="ml-auto text-[13px] text-muted">{formatDeadline(job.deadline)}</span>
      </div>
    </article>
  );
}
