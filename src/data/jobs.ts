export type Job = {
  id: string;
  organization: string;
  title: string;
  region: string;
  deadline: string;
  detailUrl?: string;
};

export function normalizeDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return value;
}

export type Dday = {
  label: string;
  days: number | null;
  urgent: boolean;
};

export function getDday(deadline: string): Dday {
  const normalized = normalizeDate(deadline);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { label: deadline || "상시", days: null, urgent: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${normalized}T00:00:00`);
  const days = Math.round((end.getTime() - today.getTime()) / 86_400_000);

  if (Number.isNaN(days)) return { label: deadline, days: null, urgent: false };
  if (days < 0) return { label: "마감", days, urgent: false };
  if (days === 0) return { label: "D-Day", days, urgent: true };
  return { label: `D-${days}`, days, urgent: days <= 7 };
}

export function formatDeadline(deadline: string) {
  const normalized = normalizeDate(deadline);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return deadline ? `${deadline} 마감` : "마감일 미정";
  return `${Number(match[2])}월 ${Number(match[3])}일 마감`;
}
