import { auth } from '../lib/firebase';
import { userError } from './dataErrors';

/** 현재 로그인한 사용자의 UID를 반환합니다. 로그인하지 않았으면 오류를 던집니다. */
export function requireUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw userError('로그인이 필요합니다.');
  return uid;
}
