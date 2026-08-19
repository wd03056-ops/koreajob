const PREFERENCES = [
  { label: "관심 지역", value: "수원시 · 성남시" },
  { label: "대상", value: "청년" },
  { label: "희망 유형", value: "공공근로 · 행정지원" },
  { label: "근무 형태", value: "주 5일, 주간" },
];

export function ProfilePage() {
  return (
    <div className="px-5 pt-6">
      <h1 className="text-[24px] font-bold tracking-tight text-ink">내 맞춤 정보</h1>
      <p className="mt-1 text-[15px] text-muted">조건에 맞는 공고를 우선 보여드려요.</p>

      <section className="mt-5 rounded-2xl bg-white p-5">
        <p className="text-[13px] font-semibold text-toss">기본 프로필</p>
        <p className="mt-2 text-[20px] font-bold text-ink">김경기</p>
        <p className="mt-0.5 text-[14px] text-muted">1998년생 · 수원시 거주</p>
      </section>

      <section className="mt-3 overflow-hidden rounded-2xl bg-white">
        {PREFERENCES.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-5 py-4 ${
              index < PREFERENCES.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <span className="text-[15px] text-muted">{item.label}</span>
            <span className="text-[15px] font-semibold text-ink">{item.value}</span>
          </div>
        ))}
      </section>

      <button
        type="button"
        className="mt-4 w-full rounded-2xl bg-toss py-3.5 text-[16px] font-bold text-white"
      >
        맞춤 정보 수정하기
      </button>
    </div>
  );
}
