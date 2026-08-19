import { SearchIcon } from "./Icons";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="mx-5 mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3.5">
      <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="수원시, 청년 일자리 검색..."
        className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}
