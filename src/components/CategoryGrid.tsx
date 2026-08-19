import type { ComponentType } from "react";
import {
  AdminIcon,
  MidCareerIcon,
  PartTimeIcon,
  PublicWorkIcon,
  SeniorIcon,
  YouthIcon,
} from "./Icons";

export type CategoryId =
  | "청년"
  | "중장년"
  | "어르신"
  | "공공근로"
  | "시간제"
  | "행정지원";

type CategoryItem = {
  id: CategoryId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

const TARGETS: CategoryItem[] = [
  { id: "청년", label: "청년", icon: YouthIcon, tone: "bg-[#E8F3FF] text-toss" },
  { id: "중장년", label: "중장년", icon: MidCareerIcon, tone: "bg-[#E6F8F0] text-[#03B26C]" },
  { id: "어르신", label: "어르신", icon: SeniorIcon, tone: "bg-[#FFF3E0] text-[#FF8A3D]" },
];

const TYPES: CategoryItem[] = [
  { id: "공공근로", label: "공공근로", icon: PublicWorkIcon, tone: "bg-[#F0ECFF] text-[#6B4EFF]" },
  { id: "시간제", label: "시간제", icon: PartTimeIcon, tone: "bg-[#E8F8FB] text-[#0FB5C4]" },
  { id: "행정지원", label: "행정지원", icon: AdminIcon, tone: "bg-[#F3F4F6] text-sub" },
];

type CategoryGridProps = {
  selected?: CategoryId | null;
  onSelect: (id: CategoryId) => void;
};

function Grid({
  items,
  selected,
  onSelect,
}: {
  items: CategoryItem[];
  selected?: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = selected === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl bg-white py-4 transition ${
              active ? "ring-2 ring-toss" : ""
            }`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[13px] font-semibold text-ink">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
  return (
    <section className="mt-6 px-5">
      <h2 className="mb-3 text-[17px] font-bold text-ink">연령별 / 대상별</h2>
      <Grid items={TARGETS} selected={selected} onSelect={onSelect} />

      <h2 className="mb-3 mt-6 text-[17px] font-bold text-ink">사업 유형별</h2>
      <Grid items={TYPES} selected={selected} onSelect={onSelect} />
    </section>
  );
}
