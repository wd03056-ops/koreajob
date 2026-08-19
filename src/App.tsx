import  { useEffect, useState } from 'react';
import { db } from './firebase'; // 본인의 firebase 설정 파일 경로에 맞게 확인해주세요
import { collection, getDocs } from 'firebase/firestore';
import './App.css';

interface Job {
  id: string;
  [key: string]: any; // 어떤 필드든 유연하게 받기 위함
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobList);
      } catch (error) {
        console.error("데이터를 불러오는 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return <div className="loading">⏳ 일자리 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="container">
      <h1>경기도 일자리 공고 목록</h1>
      <p className="count">총 {jobs.length}개의 공고가 등록되어 있습니다.</p>
      
      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            {/* API 필드명에 따라 화면에 맞게 출력 */}
            <h3>{job.PBANC_NM || job.JOB_NM || job.TITLE || "공고 제목 없음"}</h3>
            <p><strong>기관/기업명:</strong> {job.ENTRPRS_NM || job.WKPLC_NM || job.INST_NM || "정보 없음"}</p>
            <p><strong>접수마감일:</strong> {job.RCEPT_CLOS_DE || "상시 채용"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;