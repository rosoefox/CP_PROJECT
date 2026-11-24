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

// 화면 컴포넌트가 Firebase Auth API를 직접 다루지 않도록
// 회원가입·로그인·로그아웃·상태 구독을 하나의 인터페이스로 제공합니다.
// 실패 시 사용자에게 보여줄 메시지를 담은 Error를 던집니다.

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
