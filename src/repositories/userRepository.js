import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { runDataTask } from './dataErrors';

// 사용자 프로필(users/{uid}) 데이터 접근을 담당합니다. 본인 문서만 읽고 쓸 수 있습니다.
export const userRepository = {
  createProfile({ uid, email, displayName }) {
    return runDataTask(() =>
      setDoc(doc(db, 'users', uid), {
        uid,
        email,
        displayName,
        createdAt: serverTimestamp(),
      }),
    );
  },
};
