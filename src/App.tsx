import { useCallback, useState } from "react";
import type { TabId } from "./components/BottomNav";
import { BottomNav } from "./components/BottomNav";
import type { CategoryId } from "./components/CategoryGrid";
import type { Job } from "./data/jobs";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const handleJobsLoaded = useCallback((nextJobs: Job[]) => {
    setJobs(nextJobs);
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="relative mx-auto min-h-svh max-w-[430px] bg-canvas text-ink">
      <main className="pb-[calc(72px+env(safe-area-inset-bottom))]">
        {tab === "home" && (
          <HomePage
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={(id) =>
              setCategory((current) => (current === id ? null : id))
            }
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onJobsLoaded={handleJobsLoaded}
            onNotify={() => showToast("새 공고 알림이 3건 있어요")}
          />
        )}
        {tab === "saved" && (
          <FavoritesPage jobs={jobs} savedIds={savedIds} onToggleSave={toggleSave} />
        )}
        {tab === "profile" && <ProfilePage />}
      </main>

      <BottomNav tab={tab} onChange={setTab} />

      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-30 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-center text-[14px] font-medium text-white">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
