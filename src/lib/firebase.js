import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정은 .env 파일의 VITE_FIREBASE_* 값에서 읽어옵니다.
// 실제 값은 저장소에 올리지 않고, .env.example을 참고해 로컬에서 작성합니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// [Singleton 패턴] 앱 전체에서 Firebase App·Auth·Firestore 인스턴스를 하나만 생성해 공유합니다.
//   - 로그인 상태와 Firestore 연결·캐시는 인스턴스 단위로 유지되므로, 여러 개가 생기면 상태가 어긋납니다.
//   - getApps()로 이미 만든 앱이 있으면 재사용합니다. (개발 서버 HMR로 모듈이 다시 실행돼도 중복 초기화 방지)
//   - 다른 모듈은 이 파일이 내보내는 auth / db만 가져다 씁니다.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
