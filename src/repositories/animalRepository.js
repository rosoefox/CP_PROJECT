import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { requireUid } from './currentUser';
import { runDataTask } from './dataErrors';
import { toAnimal } from './firestoreAdapter';

const animalsRef = collection(db, 'animals');

// 개체 데이터 접근을 담당합니다. 화면은 Firestore API를 직접 호출하지 않습니다.
// 모든 조회는 로그인한 사용자(ownerId)의 데이터로 한정하며, 최종 권한 검사는 Security Rules가 합니다.
export const animalRepository = {
  list() {
    return runDataTask(async () => {
      const snapshot = await getDocs(query(animalsRef, where('ownerId', '==', requireUid())));
      return snapshot.docs.map(toAnimal).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  },

  get(id) {
    return runDataTask(async () => {
      const snapshot = await getDoc(doc(animalsRef, id));
      return snapshot.exists() ? toAnimal(snapshot) : null;
    });
  },

  create(data) {
    return runDataTask(async () => {
      const ownerId = requireUid();
      const ref = await addDoc(animalsRef, {
        tagNumber: data.tagNumber,
        name: data.name ?? '',
        species: data.species,
        sex: data.sex,
        birthDate: data.birthDate,
        ownerId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return toAnimal(await getDoc(ref));
    });
  },

  update(id, changes) {
    return runDataTask(async () => {
      const ref = doc(animalsRef, id);
      await updateDoc(ref, { ...changes, updatedAt: serverTimestamp() });
      return toAnimal(await getDoc(ref));
    });
  },
};
