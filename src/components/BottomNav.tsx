import { HeartIcon, HomeIcon, UserIcon } from "./Icons";

export type TabId = "home" | "saved" | "profile";

type BottomNavProps = {
  tab: TabId;
  onChange: (tab: TabId) => void;
};

const TABS = [
  { id: "home" as const, label: "홈", Icon: HomeIcon },
  { id: "saved" as const, label: "찜한 일자리", Icon: HeartIcon },
  { id: "profile" as const, label: "내 맞춤 정보", Icon: UserIcon },
];

export function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                active ? "text-toss" : "text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
