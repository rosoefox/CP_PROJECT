import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toAuthErrorMessage } from './authErrors';
import { userRepository } from '../repositories/userRepository';

// [Facade 패턴] 인증 관련 하위 시스템을 하나의 단순한 인터페이스로 감쌉니다.
//   - 하위 시스템: Firebase Auth API(계정 생성·로그인·프로필 수정·상태 구독),
//                 사용자 프로필 저장소(userRepository), 오류 메시지 변환(authErrors)
//   - Facade     : authService.signUp / signIn / signOut / subscribe
//   예) signUp 한 번이 "계정 생성 → 이름 설정 → 프로필 문서 생성 → 실패 시 한국어 메시지"를 처리합니다.
//   화면은 Firebase Auth를 몰라도 되고, 인증 방식이 바뀌어도 이 파일만 수정합니다.

async function run(action) {
  try {
    return await action();
  } catch (error) {
    const wrapped = new Error(toAuthErrorMessage(error));
    wrapped.code = error?.code;
    throw wrapped;
  }
}

export const authService = {
  signUp(email, password, displayName) {
    return run(async () => {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      await userRepository.createProfile({ uid: user.uid, email: user.email, displayName: displayName ?? '' });
      return user;
    });
  },

  signIn(email, password) {
    return run(async () => {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    });
  },

  signOut() {
    return run(() => signOut(auth));
  },

  /** 로그인 상태 변화를 구독합니다. 반환값을 호출하면 구독이 해제됩니다. */
  subscribe(listener) {
    return onAuthStateChanged(auth, listener);
  },
};
