import { BellIcon } from "./Icons";

type HeaderProps = {
  onNotify?: () => void;
};

export function Header({ onNotify }: HeaderProps) {
  return (
    <header className="flex items-start justify-between px-5 pt-6 pb-2">
      <div>
        <p className="text-[13px] font-semibold text-toss">경기 공공일자리</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-ink">
          원하는 일자리를
          <br />
          빠르게 찾아보세요
        </h1>
      </div>
      <button
        type="button"
        onClick={onNotify}
        aria-label="알림"
        className="relative mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
      >
        <BellIcon className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
      </button>
    </header>
  );
}
