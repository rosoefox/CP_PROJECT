import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { requireUid } from './currentUser';
import { runDataTask, userError } from './dataErrors';
import { healthRecordId, toHealthRecord } from './firestoreAdapter';

const recordsRef = collection(db, 'healthRecords');
const byDateDesc = (a, b) => b.date.localeCompare(a.date);

// 일일 건강 기록 데이터 접근을 담당합니다.
// 기록은 수정·삭제하지 않는 이력 데이터로 다루며, 같은 개체·같은 날짜에는 하나만 저장됩니다.
export const recordRepository = {
  listAll() {
    return runDataTask(async () => {
      const snapshot = await getDocs(query(recordsRef, where('ownerId', '==', requireUid())));
      return snapshot.docs.map(toHealthRecord).sort(byDateDesc);
    });
  },

  listByAnimal(animalId) {
    return runDataTask(async () => {
      const snapshot = await getDocs(
        query(recordsRef, where('ownerId', '==', requireUid()), where('animalId', '==', animalId)),
      );
      return snapshot.docs.map(toHealthRecord).sort(byDateDesc);
    });
  },

  create(animalId, data) {
    return runDataTask(async () => {
      const ownerId = requireUid();
      const ref = doc(recordsRef, healthRecordId(animalId, data.date));
      if ((await getDoc(ref)).exists()) {
        throw userError('해당 날짜의 기록이 이미 있습니다.');
      }
      await setDoc(ref, {
        ownerId,
        animalId,
        date: data.date,
        temperature: data.temperature,
        feedKg: data.feedKg,
        weightKg: data.weightKg,
        note: data.note ?? '',
        createdAt: serverTimestamp(),
      });
      return toHealthRecord(await getDoc(ref));
    });
  },
};
