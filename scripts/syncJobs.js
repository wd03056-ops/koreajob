import fetch from 'node-fetch';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyBhiZMtN_a3ELQmN6QZrnpWvV2QCbF4-os",
  authDomain: "koreajob.firebaseapp.com",
  projectId: "koreajob",
  storageBucket: "koreajob.firebasestorage.app",
  messagingSenderId: "222231997025",
  appId: "1:222231997025:web:f579d0854130c015be1820"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncJobData() {
    try {
        console.log("🔄 경기도 오픈API에서 데이터를 나누어 불러오는 중...");
        
        const apiKey = process.env.JOBABA_API_KEY;
        const pSize = 500; // API 호출 당 안전하게 500개씩 요청 (1000건 제한 준수)
        let pIndex = 1;
        let totalSynced = 0;

        while (true) {
            const url = `https://openapi.gg.go.kr/JobFndtnPublJob?KEY=${apiKey}&Type=json&pIndex=${pIndex}&pSize=${pSize}`;
            
            const response = await fetch(url);
            const data = await response.json();

            // 응답 구조 체크
            const jobRow = data.JobFndtnPublJob;
            if (!jobRow || jobRow.length < 2) {
                console.log("🏁 더 이상 가져올 데이터가 없습니다.");
                break;
            }

            const jobList = jobRow[1].row || [];
            if (jobList.length === 0) {
                break;
            }

            console.log(`📥 [페이지 ${pIndex}] ${jobList.length}개의 공고를 박스(Batch)에 담아 저장 중...`);

            // 📦 파이어베이스 배치(최대 500개 제한) 생성
            const batch = writeBatch(db);

            for (const job of jobList) {
                const jobId = job.IDX || job.SN || String(Math.floor(Math.random() * 10000000));
                const docRef = doc(db, "jobs", String(jobId));
                
                batch.set(docRef, {
                    ...job,
                    updatedAt: new Date()
                });
            }

            // 🚀 박스를 통째로 한 번에 전송!
            await batch.commit();
            totalSynced += jobList.length;

            // 이번에 가져온 개수가 요청한 pSize보다 적다면 마지막 페이지라는 뜻
            if (jobList.length < pSize) {
                break;
            }

            pIndex++; // 다음 페이지 번호로 이동
        }

        console.log(`✨ 총 ${totalSynced}개의 공고 동기화 완료!`);
    } catch (error) {
        console.error("❌ 동기화 중 에러 발생:", error);
    }
}

syncJobData();