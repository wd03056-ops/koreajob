// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- 이 줄을 추가해주세요!

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhiZMtN_a3ELQmN6QZrnpWvV2QCbF4-os",
  authDomain: "koreajob.firebaseapp.com",
  projectId: "koreajob",
  storageBucket: "koreajob.firebasestorage.app",
  messagingSenderId: "222231997025",
  appId: "1:222231997025:web:f579d0854130c015be1820"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 내보내기 (이걸 다른 파일에서 불러다 씁니다)
export const db = getFirestore(app);